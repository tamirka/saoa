import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import CategoryCard from '../components/ui/CategoryCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getFeaturedProducts, getCategories } from '../lib/api';
import type { Product, Category } from '../types';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredProducts, allCategories] = await Promise.all([
          getFeaturedProducts(),
          getCategories()
        ]);
        setProducts(featuredProducts);
        setCategories(allCategories);
      } catch (err) {
        setError('Failed to load page data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  <span className="block">Design Your Packaging</span>
                  <span className="block text-indigo-600 dark:text-indigo-400">In Minutes</span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-300">
                  From boxes to pouches, get custom-branded packaging from top-tier suppliers.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                  <Link to="/browse">
                      <Button size="lg" variant="primary">Browse Products</Button>
                  </Link>
                  <Link to="/signup">
                      <Button size="lg" variant="secondary">Start Designing</Button>
                  </Link>
              </div>
          </div>
      </section>
      
      {/* Category Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Shop by Category</h2>
        {loading ? <LoadingSpinner /> : error ? <p className="text-center text-red-500">{error}</p> : (
            <div className="mt-8 grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-x-8">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Featured Products</h2>
            {loading ? <LoadingSpinner /> : error ? <p className="text-center text-red-500">{error}</p> : (
                <div className="mt-8 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">How Yazbox Works</h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 text-2xl font-bold">1</div>
                <h3 className="mt-4 text-xl font-semibold">Browse & Customize</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Explore thousands of packaging products and select your desired variants.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 text-2xl font-bold">2</div>
                <h3 className="mt-4 text-xl font-semibold">Upload Your Design</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Easily upload your artwork and get a digital proof from the seller.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 text-2xl font-bold">3</div>
                <h3 className="mt-4 text-xl font-semibold">Order & Receive</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Confirm your order and get your custom packaging delivered to your door.</p>
            </div>
        </div>
      </section>

       {/* Testimonials */}
       <section className="bg-white dark:bg-gray-800 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">What Our Customers Say</h2>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
                        <blockquote className="text-gray-600 dark:text-gray-300">"Yazbox revolutionized how we source our packaging. The quality is top-notch and the platform is incredibly easy to use."</blockquote>
                        <p className="mt-4 font-semibold">- Sarah L., Founder of Glow Cosmetics</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
                        <blockquote className="text-gray-600 dark:text-gray-300">"Finding a reliable supplier for our custom pouches was a nightmare until we found Yazbox. Highly recommended!"</blockquote>
                        <p className="mt-4 font-semibold">- Mike R., Owner of The Coffee Bean Co.</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
                        <blockquote className="text-gray-600 dark:text-gray-300">"The seller communication is fantastic. We got our proofs approved in record time and the final product was perfect."</blockquote>
                        <p className="mt-4 font-semibold">- Emily C., Operations at Healthy Snacks Inc.</p>
                    </div>
                </div>
            </div>
       </section>
    </div>
  );
};

export default HomePage;
