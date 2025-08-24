
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';

const CheckoutPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { cartItems } = useCart();
    
    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.selectedVariant.pricePerUnit, 0);
    const total = subtotal + 50.00 + (subtotal * 0.08); // Mock shipping and tax

    if (step === 3) {
        return (
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Thank you for your order!</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
                <div className="mt-6">
                    <Link to="/dashboard/orders">
                        <Button variant="primary" size="lg">View My Orders</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center mb-8">Checkout</h1>
                
                {/* Stepper */}
                <ol className="flex items-center w-full max-w-2xl mx-auto text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-12">
                    <li className={`flex md:w-full items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-500' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700`}>
                        <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                           {step > 1 ? <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg> : <span className="me-2">1</span>}
                            Delivery
                        </span>
                    </li>
                    <li className={`flex md:w-full items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-500' : ''} after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700`}>
                        <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {step > 2 ? <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg> : <span className="me-2">2</span>}
                            Summary
                        </span>
                    </li>
                    <li className={`flex items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-500' : ''}`}>
                        <span className="me-2">3</span>
                        Confirmation
                    </li>
                </ol>

                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">Delivery Address</h2>
                            <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                                <input type="text" placeholder="First Name" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                <input type="text" placeholder="Last Name" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                <div className="sm:col-span-2">
                                  <input type="text" placeholder="Address" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                </div>
                                <input type="text" placeholder="City" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                                <input type="text" placeholder="Postal Code" className="block w-full border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                            </form>
                            <div className="mt-8 flex justify-end">
                                <Button onClick={() => setStep(2)}>Continue to Summary</Button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                         <div>
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cartItems.map(item => (
                                    <li key={item.id} className="py-4 flex items-center">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />
                                        <div className="ml-4 flex-1">
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} x ${item.selectedVariant.pricePerUnit.toFixed(2)}</p>
                                        </div>
                                        <p className="font-medium">${(item.quantity * item.selectedVariant.pricePerUnit).toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                            <dl className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <dt>Total</dt>
                                    <dd>${total.toFixed(2)}</dd>
                                </div>
                            </dl>
                            <div className="mt-8 flex justify-between">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back to Delivery</Button>
                                <Button onClick={() => setStep(3)}>Confirm Order</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;