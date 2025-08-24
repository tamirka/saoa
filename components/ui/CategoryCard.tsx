
import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';

interface CategoryCardProps {
    category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    return (
        <Link to="/browse" className="group relative block">
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64">
                <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover object-center"
                />
            </div>
             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                <h3 className="text-xl font-semibold text-white">
                   {category.name}
                </h3>
            </div>
        </Link>
    );
};

export default CategoryCard;
