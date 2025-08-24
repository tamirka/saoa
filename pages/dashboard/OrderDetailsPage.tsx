import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrderProgress from '../../components/ui/OrderProgress';
import { getOrderDetails } from '../../lib/api';
import type { Order } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const fetchedOrder = await getOrderDetails(parseInt(orderId, 10));
                setOrder(fetchedOrder as any);
            } catch (err) {
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) return <LoadingSpinner />;
    
    if (error || !order) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">{error || "Order Not Found"}</h2>
                <Link to="/dashboard/orders" className="text-indigo-600 hover:underline">
                    &larr; Back to all orders
                </Link>
            </div>
        );
    }

    // Mock history for now as it's not in the DB schema
    const mockStatusHistory = [
        { status: 'Pending', date: order.created_at },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                <Link to="/dashboard/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    &larr; Back to orders
                </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Order number</p>
                        <p className="font-medium">{order.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date placed</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total amount</p>
                        <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                        <p className="font-medium">{order.status}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Order Progress</h3>
                <OrderProgress history={mockStatusHistory} currentStatus={order.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium mb-4">Items in Order</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {order.order_items.map(item => (
                            <li key={item.id} className="p-4 flex">
                                <img src={item.products.images[0]} alt={item.products.name} className="w-16 h-16 rounded-md object-cover"/>
                                <div className="ml-4 flex-1 flex flex-col justify-center">
                                    <p className="font-medium">{item.products.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity} units</p>
                                </div>
                                <p className="font-medium">${(item.quantity * Number(item.unit_price)).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                     <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-gray-600 dark:text-gray-300">{order.shipping_address?.address || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
