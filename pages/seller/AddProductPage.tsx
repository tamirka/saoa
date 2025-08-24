
import React, { useState } from 'react';
import Button from '../../components/ui/Button';

const AddProductPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [productData, setProductData] = useState({
        title: '',
        category: '',
        description: '',
    });

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            
            {/* Simple Stepper */}
            <div className="mb-8">
                <ol className="flex items-center w-full">
                    <li className={`flex w-full items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:inline-block dark:after:border-gray-700`}>
                        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">1</span>
                    </li>
                    <li className={`flex w-full items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 2 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:inline-block dark:after:border-gray-700`}>
                        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">2</span>
                    </li>
                    <li className={`flex items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'}`}>
                        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">3</span>
                    </li>
                </ol>
            </div>

            {step === 1 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <input name="title" value={productData.title} onChange={handleChange} placeholder="Product Title" className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        <select name="category" value={productData.category} onChange={handleChange} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                            <option>Select Category</option>
                            <option>Boxes</option>
                            <option>Pouches</option>
                        </select>
                        <textarea name="description" value={productData.description} onChange={handleChange} placeholder="Description" rows={4} className="w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Variants & Pricing</h3>
                    <p>Form for adding sizes, paper types, and prices would go here.</p>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3 className="text-lg font-medium mb-4">Images & Preview</h3>
                    <p>Image uploader and a preview of the product listing would be here.</p>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                {step > 1 ? (
                    <Button variant="secondary" onClick={handlePrev}>Previous</Button>
                ) : <div />}
                {step < 3 ? (
                    <Button onClick={handleNext}>Next</Button>
                ) : (
                    <Button>Publish Product</Button>
                )}
            </div>
        </div>
    );
};

export default AddProductPage;