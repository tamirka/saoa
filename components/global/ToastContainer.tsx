
import React, { useState } from 'react';
import { useToasts } from '../../hooks/useToast';
import Toast from './Toast';
import type { Toast as ToastType } from '../../types';

const ToastContainer: React.FC = () => {
  const toasts = useToasts();
  // We need a local way to dismiss toasts for the UI, but the context handles auto-dismissal
  const [visibleToasts, setVisibleToasts] = useState<ToastType[]>(toasts);

  React.useEffect(() => {
    setVisibleToasts(toasts);
  }, [toasts]);

  const handleDismiss = (id: number) => {
    setVisibleToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-3">
      {visibleToasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;