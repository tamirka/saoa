import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/global/Navbar';
import Footer from './components/global/Footer';
import ToastContainer from './components/global/ToastContainer';
import HomePage from './pages/HomePage';
import BrowseProductsPage from './pages/BrowseProductsPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import OrderDetailsPage from './pages/dashboard/OrderDetailsPage';
import AddProductPage from './pages/seller/AddProductPage';
import SellerProductsPage from './pages/dashboard/seller/SellerProductsPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import NotificationsPage from './pages/NotificationsPage';
import OnboardingPage from './pages/seller/OnboardingPage';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseProductsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/seller-onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<OrdersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="add-product" element={<AddProductPage />} />
            <Route path="my-products" element={<SellerProductsPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default App;
