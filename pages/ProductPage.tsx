import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import FileUploader from '../components/ui/FileUploader';
import { StarIcon } from '../components/ui/Icons';
import type { Review, Product } from '../types';
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

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
    return (
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
                <StarRating rating={review.rating} />
                <p className="ml-4 font-bold text-gray-900 dark:text-white">{review.author}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
            <p className="text-sm text-gray-400 mt-2">{review.date}</p>
        </div>
    );
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContacting, setIsContacting] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(100);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const productData = await getProductById(id);
            if (productData) {
                setProduct(productData);
                setSelectedImage(productData.images?.[0] || productData.imageUrl);
                setSelectedVariantId(productData.variants?.[0]?.id);
                setQuantity(productData.minOrderQuantity);
            } else {
                setError("Product not found.");
            }
        } catch (err) {
            setError("Failed to fetch product details.");
        } finally {
            setLoading(false);
        }
    };
    fetchProduct();
  }, [id]);

  const handleContactSeller = async () => {
    if (!product?.seller.id) return;
    setIsContacting(true);
    try {
      const conversationId = await getOrCreateConversation(product.seller.id);
      navigate(`/messages?conversationId=${conversationId}`);
    } catch (err) {
      addToast('Could not start conversation.', 'error');
      console.error(err);
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
  }
  
  if (error || !product) {
    return <div className="text-center py-20">{error || 'Product not found.'}</div>;
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  
  const totalPrice = selectedVariant ? (selectedVariant.pricePerUnit * quantity).toFixed(2) : '0.00';

  const handleAddToCart = () => {
    if (product && selectedVariant) {
        addToCart(product, selectedVariant, quantity, uploadedFile ? { name: uploadedFile.name } : undefined);
        addToast('Product added to cart!', 'success');
    } else {
        addToast('Please select a variant.', 'error');
    }
  };


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
                    <StarRating rating={product.rating} />
                    <a href="#reviews" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{product.reviewsCount} reviews</a>
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
                    {product.variants.map(variant => (
                        <button key={variant.id} onClick={() => setSelectedVariantId(variant.id)}
                            className={`p-3 border rounded-md text-sm text-left ${selectedVariantId === variant.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            <span className="font-semibold block">{variant.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{variant.paperType}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
                <h3 className="text-sm text-gray-900 dark:text-white font-medium">Quantity</h3>
                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(product.minOrderQuantity, parseInt(e.target.value, 10) || product.minOrderQuantity))}
                    min={product.minOrderQuantity} step="50"
                    className="mt-2 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum order: {product.minOrderQuantity} units</p>
            </div>
            
            {/* File Upload */}
            <div className="mt-6">
                <h3 className="text-sm text-gray-900 dark:text-white font-medium">Upload Artwork</h3>
                <FileUploader onFileChange={setUploadedFile} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button size="lg" variant="secondary" onClick={handleContactSeller} disabled={isContacting}>
                  {isContacting ? 'Opening...' : 'Contact Seller'}
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
                    <button id="reviews" onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>Reviews ({product.reviews.length})</button>
                </nav>
            </div>
            <div className="mt-8">
                {activeTab === 'description' && <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"><p>{product.description}</p></div>}
                {activeTab === 'faqs' && (
                    <div className="space-y-4">
                        {product.faqs.length > 0 ? product.faqs.map((faq, i) => (
                            <div key={i}>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h4>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">{faq.answer}</p>
                            </div>
                        )) : <p>No frequently asked questions for this product.</p>}
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div>
                        {product.reviews.length > 0 ? product.reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        )) : <p>No reviews yet for this product.</p>}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;