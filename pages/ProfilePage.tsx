import React from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
    const { user, switchRole } = useAuth();
    
    if (!user) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
            <div className="space-y-8">
                {/* Role Switcher */}
                 <div>
                    <h3 className="text-lg font-medium">User Role</h3>
                    <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="font-semibold">Current View: {user.role === 'buyer' ? 'Buyer' : 'Seller'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch your view to access seller features.</p>
                        </div>
                        <label htmlFor="role-switch" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="role-switch" className="sr-only" checked={user.role === 'seller'} onChange={switchRole} />
                                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${user.role === 'seller' ? 'transform translate-x-full bg-indigo-400' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Profile Info */}
                <div>
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <form className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <input type="text" placeholder="Full Name" defaultValue={user.name} className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        <div className="sm:col-span-2">
                            <input type="email" placeholder="Email Address" defaultValue={user.email} className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div>
                     <h3 className="text-lg font-medium">Change Password</h3>
                    <form className="mt-4 grid grid-cols-1 gap-y-6">
                        <input type="password" placeholder="Current Password" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        <input type="password" placeholder="New Password" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        <input type="password" placeholder="Confirm New Password" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </form>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <Button>Save Changes</Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;