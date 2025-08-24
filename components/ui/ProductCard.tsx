
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { StarIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-w-4 aspect-h-3">
          <img className="object-cover w-full h-full" src={product.imageUrl} alt={product.name} />
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              MOQ: <span className="font-medium">{product.minOrderQuantity} units</span>
            </p>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{product.rating} ({product.reviewsCount})</span>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <img src={product.seller.logoUrl} alt={product.seller.name} className="h-6 w-6 rounded-full"/>
            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{product.seller.name}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
