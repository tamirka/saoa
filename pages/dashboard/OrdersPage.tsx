import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getOrders } from '../../lib/api';
import type { Order } from '../../types';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const ordersData = await getOrders();
                setOrders(ordersData);
            } catch (err) {
                setError("Failed to fetch your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Shipped': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'In Production': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }
    
    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h2>
            {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                                <div>
                                    <p className="font-bold text-lg">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                {order.items.slice(0, 1).map(item => ( // Show only the first item for summary
                                    <div key={item.id} className="flex items-center mb-2">
                                        <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded object-cover"/>
                                        <p className="ml-4 text-sm font-medium">{item.name}{order.items.length > 1 && ` and ${order.items.length - 1} more...`}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
                                <Link to={`/dashboard/orders/${order.id}`}>
                                    <Button variant="secondary" size="sm">View Details</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
