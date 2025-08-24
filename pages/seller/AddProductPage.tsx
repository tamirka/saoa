import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import FileUploader from '../../components/ui/FileUploader';
import { getCategories, createProduct } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import type { Category } from '../../types';

interface VariantFormData {
    id: number; // temporary client-side ID for list key
    name: string;
    paper_type: string;
    price_per_unit: string;
}

const AddProductPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [productData, setProductData] = useState({
        name: '',
        category_id: '',
        description: '',
        min_order_quantity: '50',
    });
    const [variants, setVariants] = useState<VariantFormData[]>([
        { id: Date.now(), name: '', paper_type: '', price_per_unit: '' }
    ]);
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (err) {
                addToast('Could not load categories', 'error');
            }
        };
        fetchCategories();
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProductData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleVariantChange = (id: number, field: keyof Omit<VariantFormData, 'id'>, value: string) => {
        setVariants(currentVariants => 
            currentVariants.map(v => v.id === id ? { ...v, [field]: value } : v)
        );
    };
    
    const addVariant = () => {
        setVariants(prev => [...prev, { id: Date.now(), name: '', paper_type: '', price_per_unit: '' }]);
    };
    
    const removeVariant = (id: number) => {
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    const handlePublish = async () => {
        setError(null);
        if (!user) {
            setError("You must be logged in to publish a product.");
            return;
        }
        if (!productData.name || !productData.category_id || images.length === 0 || variants.some(v => !v.name || !v.price_per_unit)) {
            setError("Please fill in all required fields, add at least one variant, and upload at least one image.");
            return;
        }
        
        setIsLoading(true);
        try {
            await createProduct(user.id, productData, variants, images);
            addToast("Product published successfully!", 'success');
            navigate('/dashboard/my-products');
        } catch (err: any) {
            setError(err.message || 'An error occurred during publishing.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            
            <div className="mb-8 flex justify-between items-center max-w-xl mx-auto">
                <div className={`text-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Step 1: Details</div>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
                <div className={`text-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Step 2: Variants</div>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
                <div className={`text-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Step 3: Images</div>
            </div>

            {error && <p className="text-center text-red-500 mb-4">{error}</p>}

            {step === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div>
                        <label>Product Name</label>
                        <input name="name" value={productData.name} onChange={handleChange} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                    <div>
                        <label>Category</label>
                        <select name="category_id" value={productData.category_id} onChange={handleChange} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea name="description" value={productData.description} onChange={handleChange} rows={4} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                     <div>
                        <label>Minimum Order Quantity</label>
                        <input name="min_order_quantity" type="number" value={productData.min_order_quantity} onChange={handleChange} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Variants & Pricing</h3>
                    {variants.map((variant, index) => (
                        <div key={variant.id} className="p-4 border rounded-md dark:border-gray-700 space-y-3 relative">
                            {variants.length > 1 && (
                                <button onClick={() => removeVariant(variant.id)} className="absolute top-2 right-2 text-red-500">&times;</button>
                            )}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input placeholder="Variant Name (e.g., Small)" value={variant.name} onChange={e => handleVariantChange(variant.id, 'name', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                <input placeholder="Paper Type (e.g., Kraft)" value={variant.paper_type} onChange={e => handleVariantChange(variant.id, 'paper_type', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                <input type="number" placeholder="Price Per Unit ($)" value={variant.price_per_unit} onChange={e => handleVariantChange(variant.id, 'price_per_unit', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                            </div>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={addVariant}>Add Another Variant</Button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Product Images</h3>
                    <FileUploader multiple onFilesChange={setImages} />
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                {step > 1 ? (
                    <Button variant="secondary" onClick={handlePrev}>Previous</Button>
                ) : <div />}
                {step < 3 ? (
                    <Button onClick={handleNext}>Next</Button>
                ) : (
                    <Button onClick={handlePublish} disabled={isLoading}>
                        {isLoading ? 'Publishing...' : 'Publish Product'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddProductPage;
