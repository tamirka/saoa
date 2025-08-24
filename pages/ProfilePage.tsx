import React from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    
    if (!user) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
            <div className="space-y-8">
                {/* Profile Info */}
                <div>
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <form className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <input type="text" placeholder="Full Name" defaultValue={user.full_name} className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                        <div className="sm:col-span-2">
                             {/* Email is not part of the 'profiles' table, but on auth.users. It's read-only here for simplicity. */}
                            <input type="email" placeholder="Email Address" disabled className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800" />
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
