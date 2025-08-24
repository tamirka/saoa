import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '../components/ui/Icons';
import { getNotifications } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Notification } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NotificationsPage: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications(user.id);
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Notifications</h1>
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map(notification => (
                                <li key={notification.id}>
                                    <Link to={notification.link || '#'} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div className="px-4 py-4 sm:px-6 flex items-center">
                                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.is_read ? 'bg-gray-200 dark:bg-gray-600' : 'bg-indigo-500'}`}>
                                                <BellIcon className={`h-6 w-6 ${notification.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className={`text-sm font-medium ${notification.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="ml-2 h-2.5 w-2.5 bg-indigo-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">You have no notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
