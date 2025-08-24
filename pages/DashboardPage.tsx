import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const buyerLinks = [
    { name: 'My Orders', path: '/dashboard/orders' },
    { name: 'Messages', path: '/messages' },
    { name: 'My Profile', path: '/profile' },
];

const sellerLinks = [
    { name: 'My Products', path: '/dashboard/my-products' },
    { name: 'Add New Product', path: '/dashboard/add-product' },
    // more seller links here
]

const DashboardPage: React.FC = () => {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isSeller = user?.role === 'seller';
    const activeClassName = "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300";
    const inactiveClassName = "hover:bg-gray-100 dark:hover:bg-gray-800";
    
    const navLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${isActive ? activeClassName : inactiveClassName} block px-3 py-2 rounded-md text-sm font-medium`;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
                {isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-24">
                        <nav className="space-y-2">
                           <div>
                                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer Menu</h3>
                                {buyerLinks.map(link => (
                                    <NavLink key={link.name} to={link.path} end={link.path.endsWith('/orders')} className={navLinkClass}>
                                        {link.name}
                                    </NavLink>
                                ))}
                            </div>
                            {isSeller && (
                                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller Menu</h3>
                                    {sellerLinks.map(link => (
                                        <NavLink key={link.name} to={link.path} className={navLinkClass}>
                                            {link.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </nav>
                    </div>
                </aside>
                <main className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md min-h-[400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
