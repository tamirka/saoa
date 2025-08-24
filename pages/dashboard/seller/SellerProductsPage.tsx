import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { getSellerProducts } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import type { Product } from '../../../types';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const SellerProductsPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!user) return;
        const fetchProducts = async () => {
            try {
                const sellerProducts = await getSellerProducts(user.id);
                setProducts(sellerProducts as any[]);
            } catch (err) {
                setError("Failed to load your products.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [user]);
    
    if(loading) return <LoadingSpinner />;
    if(error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h2>
                <Link to="/dashboard/add-product">
                    <Button>Add New Product</Button>
                </Link>
            </div>
            {products.length === 0 ? (
                <p>You haven't added any products yet.</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map(product => (
                            <li key={product.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center space-x-4">
                                    <img className="h-16 w-16 rounded-md object-cover" src={product.images[0]} alt={product.name} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.categories?.name}</p>
                                        <p className="text-sm text-gray-500">MOQ: {product.min_order_quantity}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="secondary" size="sm">Analytics</Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SellerProductsPage;
