import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import FileUploader from '../../components/ui/FileUploader';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { createSellerProfile } from '../../lib/api';

const OnboardingPage: React.FC = () => {
    // The switchToSeller function is crucial to update the app's state
    const { user, switchToSeller } = useAuth(); 
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        company_name: '',
        description: '',
        shipping_policy: '',
        return_policy: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !logoFile || !formData.company_name) {
            addToast('Please fill out all fields and upload a logo.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await createSellerProfile(user.id, formData, logoFile);
            addToast("Your seller profile has been created!", 'success');
            
            // This is the critical fix: update the user's role in the frontend state
            switchToSeller(); 
            
            navigate('/dashboard/my-products', { replace: true });
        } catch (error: any) {
            addToast(error.message || "Failed to create profile.", 'error');
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) {
        // This case should ideally be handled by a protected route
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Please sign in</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">You must be logged in to create a seller profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
                    Become a Seller
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Tell us about your company to get started.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                        <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g., PackPro Inc." className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
                        <FileUploader onFileChange={setLogoFile} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What makes your packaging special?" rows={3} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Policy</label>
                        <textarea name="shipping_policy" value={formData.shipping_policy} onChange={handleChange} placeholder="Describe your shipping process, lead times, and regions you ship to." rows={3} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Policy</label>
                        <textarea name="return_policy" value={formData.return_policy} onChange={handleChange} placeholder="Describe your policy on returns and refunds for custom products." rows={3} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving Your Profile...' : 'Create My Shop'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;
