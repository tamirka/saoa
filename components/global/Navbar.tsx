import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/auth';
import { SunIcon, MoonIcon, Logo, ShoppingCartIcon, MenuIcon, XIcon, BellIcon, ChevronDownIcon } from '../ui/Icons';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { itemCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const guestLinks = [
        { name: 'Browse Products', path: '/browse' },
        { name: 'Become a Seller', path: '/signup' },
    ];
    
    const authedLinks = [
        { name: 'Browse Products', path: '/browse' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Messages', path: '/messages' },
    ];
    
    const navLinks = isAuthenticated ? authedLinks : guestLinks;
    
    const handleLogout = async () => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        await signOut();
        logout();
    }

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                             <span className="sr-only">Yazbox</span>
                             <Logo className="h-6 w-auto text-indigo-600 dark:text-indigo-400" />
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map(link => (
                            <Link key={link.name} to={link.path} className="text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                       <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                           <span className="sr-only">Toggle theme</span>
                           {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                       </button>

                       {isAuthenticated && (
                           <Link to="/notifications" className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                               <span className="sr-only">Notifications</span>
                               <BellIcon className="h-5 w-5" />
                           </Link>
                       )}

                        <Link to="/cart" className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                           <span className="sr-only">Cart</span>
                           <ShoppingCartIcon className="h-5 w-5" />
                           {itemCount > 0 && (
                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                                {itemCount}
                            </span>
                           )}
                        </Link>

                       <div className="hidden md:flex items-center space-x-2">
                           {!isAuthenticated ? (
                               <>
                                   <Link to="/login">
                                       <Button variant="ghost">Sign In</Button>
                                   </Link>
                                   <Link to="/signup">
                                       <Button variant="primary">Sign Up</Button>
                                   </Link>
                               </>
                           ) : (
                               <div className="relative">
                                   <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                       <span className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300">{user?.name.charAt(0).toUpperCase()}</span>
                                       <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                   </button>
                                   {isProfileOpen && (
                                       <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                           <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                                           <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</Link>
                                           <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                               Logout
                                           </button>
                                       </div>
                                   )}
                               </div>
                           )}
                       </div>

                       <div className="md:hidden">
                           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                               <span className="sr-only">Open menu</span>
                               {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                           </button>
                       </div>
                    </div>
                </div>
            </div>
            
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <Link key={link.name} to={link.path} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                         {!isAuthenticated ? (
                            <div className="px-5 flex items-center justify-start space-x-4">
                                <Link to="/login">
                                    <Button variant="ghost" onClick={() => setIsMenuOpen(false)}>Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Button>
                                </Link>
                            </div>
                        ) : (
                             <div className="px-5">
                                 <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                     Logout
                                 </button>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
