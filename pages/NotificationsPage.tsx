import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '../components/ui/Icons';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getNotifications } from '../lib/api';
import type { Notification } from '../types';

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await getNotifications();
                setNotifications(data);
            } catch (err) {
                setError("Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Notifications</h1>
            <div className="max-w-3xl mx-auto">
                {loading ? <LoadingSpinner /> : error ? <p className="text-red-500 text-center">{error}</p> : (
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <li key={notification.id}>
                                        <Link to={notification.link} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <div className="px-4 py-4 sm:px-6 flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-200 dark:bg-gray-600' : 'bg-indigo-500'}`}>
                                                    <BellIcon className={`h-6 w-6 ${notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <p className={`text-sm font-medium ${notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(notification.date).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notification.read && (
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
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
