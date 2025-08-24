
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.selectedVariant.pricePerUnit, 0);
    const taxes = subtotal * 0.08;
    const shipping = 50.00;
    const total = subtotal + taxes + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Your cart is empty</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Looks like you haven't added anything to your cart yet.</p>
                <div className="mt-6">
                    <Link to="/browse">
                        <Button variant="primary" size="lg">Start Shopping</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center">Shopping Cart</h1>
                
                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="border-t border-b border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                            {cartItems.map(item => (
                                <li key={item.id} className="flex py-6">
                                    <div className="flex-shrink-0">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"/>
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                                                </h3>
                                                <p className="ml-4 text-base font-medium text-gray-900 dark:text-white">${(item.quantity * item.selectedVariant.pricePerUnit).toFixed(2)}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.selectedVariant.name} - {item.selectedVariant.paperType}</p>
                                            <div className="mt-1 flex items-center">
                                                <label htmlFor={`quantity-${item.id}`} className="mr-2 text-sm text-gray-500 dark:text-gray-400">Qty:</label>
                                                <input
                                                    id={`quantity-${item.id}`}
                                                    type="number"
                                                    min={item.product.minOrderQuantity}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                                                    className="w-20 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex-1 flex items-end justify-between">
                                            {item.uploadedFile ? (
                                                <p className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <span>{item.uploadedFile.name}</span>
                                                </p>
                                            ) : <div />}
                                            <div className="ml-4">
                                                <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-16 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</dd>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                                <dt className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span>Shipping estimate</span>
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">${shipping.toFixed(2)}</dd>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                                <dt className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <span>Tax estimate</span>
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">${taxes.toFixed(2)}</dd>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                                <dt className="text-base font-medium text-gray-900 dark:text-white">Order total</dt>
                                <dd className="text-base font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
                                Checkout
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CartPage;