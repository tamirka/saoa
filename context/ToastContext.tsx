
import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { Toast, ToastContextType } from '../types';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast['type']) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 5000); // Auto-dismiss after 5 seconds
    }, []);

    const value = useMemo(() => ({ addToast, toasts }), [addToast, toasts]);

    // This is a bit of a hack to pass toasts to the ToastContainer without creating a circular dependency
    // or forcing the container to be a child of the provider in the same file.
    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* The ToastContainer will be rendered at the App root and get toasts from this context */}
        </ToastContext.Provider>
    );
};