
import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedVariant: ProductVariant, quantity: number, uploadedFile?: { name: string }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  itemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('yazbox-cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('yazbox-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, selectedVariant: ProductVariant, quantity: number, uploadedFile?: { name: string }) => {
    setCartItems(prevItems => {
      const itemId = `${product.id}-${selectedVariant.id}`;
      const existingItem = prevItems.find(item => item.id === itemId);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          selectedVariant,
          quantity,
          uploadedFile,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(item.product.minOrderQuantity, quantity) } : item
      )
    );
  };
  
  const itemCount = useMemo(() => cartItems.reduce((sum, item) => sum + 1, 0), [cartItems]);

  const value = useMemo(() => ({ cartItems, addToCart, removeFromCart, updateQuantity, itemCount }), [cartItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};