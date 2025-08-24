import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { SearchIcon, ChevronDownIcon } from '../components/ui/Icons';
import { getAllProducts, getCategories } from '../lib/api';
import type { Product, Category } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BrowseProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [maxMoq, setMaxMoq] = useState(1000);
    const [sortBy, setSortBy] = useState('popularity');

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                searchTerm,
                categories: selectedCategories,
                maxMoq,
                sortBy,
            };
            const fetchedProducts = await getAllProducts(filters);
            setProducts(fetchedProducts);
        } catch (err) {
            setError('Could not load products.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategories, maxMoq, sortBy]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
                await fetchProducts();
            } catch (err) {
                setError('Could not load filters.');
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array for initial load
    
    // This effect re-runs the search when filters change
    useEffect(() => {
        // We use a timeout to debounce the search input
        const handler = setTimeout(() => {
            fetchProducts();
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, selectedCategories, maxMoq, sortBy, fetchProducts]);


    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Browse Products</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">Find the perfect packaging for your brand.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                             <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
                             <div className="space-y-6">
                                {/* Search */}
                                <div>
                                    <label htmlFor="search" className="sr-only">Search</label>
                                    <div className="relative">
                                        <input
                                            type="search"
                                            name="search"
                                            id="search"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Search products..."
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Category</h3>
                                    <div className="mt-2 space-y-2">
                                        {categories.map(category => (
                                            <div key={category.id} className="flex items-center">
                                                <input id={category.name} name="category[]" type="checkbox" onChange={() => handleCategoryChange(category.id)} className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500" />
                                                <label htmlFor={category.name} className="ml-3 text-sm text-gray-600 dark:text-gray-300">{category.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* MOQ Filter */}
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Maximum MOQ</h3>
                                    <div className="mt-2">
                                      <input type="range" min="50" max="1000" step="50" value={maxMoq} onChange={e => setMaxMoq(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          <span>50</span>
                                          <span>{maxMoq}{maxMoq === 1000 && '+'}</span>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                    
                    {/* Product Grid */}
                    <main className="lg:col-span-3">
                         <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                             <p className="text-sm text-gray-600 dark:text-gray-400">{products.length} products found</p>
                             <div className="relative">
                                <select onChange={e => setSortBy(e.target.value)} value={sortBy} className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="popularity">Sort by Popularity</option>
                                    <option value="newest">Sort by Newest</option>
                                    <option value="price_asc">Sort by Price: Low to High</option>
                                    <option value="price_desc">Sort by Price: High to Low</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400" />
                             </div>
                         </div>
                        
                        {loading ? <LoadingSpinner /> : error ? <p className="text-center text-red-500">{error}</p> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                       
                         {/* Pagination (Static) */}
                        <nav className="mt-12 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0">
                            <div className="flex-1 flex justify-between sm:justify-end pt-4">
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                Previous
                                </button>
                                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                Next
                                </button>
                            </div>
                        </nav>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrowseProductsPage;
