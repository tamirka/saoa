
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Icons';

const Footer: React.FC = () => {
  const footerLinks = {
    'Company': [
      { name: 'About Us', path: '#' },
      { name: 'Careers', path: '#' },
      { name: 'Blog', path: '#' },
    ],
    'Support': [
      { name: 'Help Center', path: '#' },
      { name: 'Contact Us', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Privacy Policy', path: '#' },
    ],
    'Sellers': [
        { name: 'Become a Seller', path: '/signup' },
        { name: 'Seller Hub', path: '#' },
    ]
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-auto text-indigo-600 dark:text-indigo-400" />
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Your one-stop marketplace for custom packaging.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{title}</h3>
              <ul className="mt-4 space-y-4">
                {links.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Yazbox, Inc. All rights reserved.</p>
          {/* Social media icons can go here */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
