
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import FileUploader from '../../components/ui/FileUploader';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { createSellerProfile } from '../../lib/api';

const OnboardingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        company_name: '',
        description: '',
        logo: null as File | null,
        shipping_policy: '',
        return_policy: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (file: File | null) => {
        setFormData(prev => ({ ...prev, logo: file }));
    };
    
    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            await createSellerProfile(formData);
            addToast("Your seller profile has been created!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(`Failed to create profile: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    if (user?.role !== 'seller') {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Access Denied</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">This page is for sellers only.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
                    Welcome, Seller!
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Let's set up your shop.</p>
                
                <div className="mb-8">
                    <ol className="flex items-center w-full">
                        <li className={`flex w-full items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:inline-block dark:after:border-gray-700`}>
                            <div className="flex flex-col items-center">
                               <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${step >= 1 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>1</span>
                               <span className="text-xs mt-1">Details</span>
                            </div>
                        </li>
                        <li className={`flex w-full items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 2 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:inline-block dark:after:border-gray-700`}>
                            <div className="flex flex-col items-center">
                               <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${step >= 2 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>2</span>
                               <span className="text-xs mt-1">Policies</span>
                            </div>
                        </li>
                        <li className={`flex items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-500'}`}>
                            <div className="flex flex-col items-center">
                               <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${step >= 3 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>3</span>
                               <span className="text-xs mt-1">Finish</span>
                            </div>
                        </li>
                    </ol>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium">Company Details</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                            <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g., PackPro Inc." className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
                            <FileUploader onFileChange={handleFileChange} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What makes your packaging special?" rows={4} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium">Shipping & Policies</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Policy</label>
                            <textarea name="shipping_policy" value={formData.shipping_policy} onChange={handleChange} placeholder="Describe your shipping process, lead times, and regions you ship to." rows={4} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Policy</label>
                            <textarea name="return_policy" value={formData.return_policy} onChange={handleChange} placeholder="Describe your policy on returns and refunds for custom products." rows={4} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                    </div>
                )}
                
                {step === 3 && (
                     <div className="text-center">
                        <h3 className="text-xl font-medium">Ready to Go!</h3>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">You've successfully set up your seller profile. You can now start adding products to your shop.</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Click the button below to go to your dashboard.</p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="secondary" onClick={handlePrev}>Previous</Button>
                    ) : <div />}
                    {step < 3 ? (
                        <Button type="button" onClick={handleNext}>Next</Button>
                    ) : (
                        <Button type="button" onClick={handleFinish} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Go to Dashboard'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
