import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import FileUploader from '../components/ui/FileUploader';
import { StarIcon } from '../components/ui/Icons';
import type { Product, ProductVariant, Seller } from '../types';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { getProductById, getOrCreateConversation } from '../lib/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  );
};

type FullProduct = Product & { product_variants: ProductVariant[], sellers: Seller };

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(50);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        if (fetchedProduct) {
          setSelectedImage(fetchedProduct.images?.[0]);
          setSelectedVariantId(fetchedProduct.product_variants?.[0]?.id);
          setQuantity(fetchedProduct.min_order_quantity);
        }
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleContactSeller = async () => {
    if (!product) return;
    try {
        await getOrCreateConversation(product.seller_id);
        addToast('Conversation started!', 'info');
        navigate('/messages');
    } catch (err) {
        addToast('Could not start conversation.', 'error');
    }
  };

  const selectedVariant = product?.product_variants.find(v => v.id === selectedVariantId);
  const totalPrice = selectedVariant ? (selectedVariant.price_per_unit * quantity).toFixed(2) : '0.00';

  const handleAddToCart = () => {
    if (product && selectedVariant) {
        addToCart(product, selectedVariant, quantity, uploadedFile ? { name: uploadedFile.name } : undefined);
        addToast('Product added to cart!', 'success');
    } else {
        addToast('Please select a variant.', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-center object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-4">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(img)} className={`rounded-lg overflow-hidden border-2 ${selectedImage === img ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-center object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:mt-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{product.name}</h1>
            
            <div className="mt-4 flex items-center">
                <div className="flex items-center">
                    <StarRating rating={4.5} /> {/* Mock rating */}
                    <a href="#reviews" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">120 reviews</a>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-3xl text-gray-900 dark:text-white">${totalPrice}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">for {quantity} units</p>
            </div>

            {/* Variant Selection */}
            <div className="mt-6">
                <h3 className="text-sm text-gray-900 dark:text-white font-medium">Size & Paper Type</h3>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.product_variants.map(variant => (
                        <button key={variant.id} onClick={() => setSelectedVariantId(variant.id)}
                            className={`p-3 border rounded-md text-sm text-left ${selectedVariantId === variant.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            <span className="font-semibold block">{variant.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{variant.paper_type}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
                <h3 className="text-sm text-gray-900 dark:text-white font-medium">Quantity</h3>
                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(product.min_order_quantity, parseInt(e.target.value, 10) || product.min_order_quantity))}
                    min={product.min_order_quantity} step="50"
                    className="mt-2 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum order: {product.min_order_quantity} units</p>
            </div>
            
            {/* File Upload */}
            <div className="mt-6">
                <h3 className="text-sm text-gray-900 dark:text-white font-medium">Upload Artwork</h3>
                <FileUploader onFileChange={setUploadedFile} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button size="lg" variant="secondary" onClick={handleContactSeller}>
                  Contact Seller
                </Button>
                <Button size="lg" variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
            </div>
          </div>
        </div>

        {/* Description, FAQs, Reviews */}
        <div className="mt-16">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('description')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'description' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>Description</button>
                    <button onClick={() => setActiveTab('faqs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faqs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>FAQs</button>
                    <button id="reviews" onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>Reviews</button>
                </nav>
            </div>
            <div className="mt-8">
                {activeTab === 'description' && <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"><p>{product.description}</p></div>}
                {activeTab === 'faqs' && <p>No frequently asked questions for this product.</p>}
                {activeTab === 'reviews' && <p>No reviews yet for this product.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
