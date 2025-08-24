
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import type { ToastContextType } from '../types';

export const useToast = (): Pick<ToastContextType, 'addToast'> => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return { addToast: context.addToast };
};

// A hook for the container to get the toasts themselves
export const useToasts = () => {
    const context = useContext(ToastContext) as any; // Cast to access internal state
    if (!context) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context.toasts;
}