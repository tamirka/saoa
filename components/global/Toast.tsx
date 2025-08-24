
import React from 'react';
import type { Toast as ToastType } from '../../types';
import { XIcon } from '../ui/Icons';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-4';
  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type]}`}>
      <div className="flex-1">
        <p className="font-medium">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="p-1 rounded-full hover:bg-black/10">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;