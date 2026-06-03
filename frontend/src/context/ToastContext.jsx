import { createContext, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export const ToastContext = createContext();

export default function ToastProvider({ children }) {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const showInfo = useCallback((message) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      <Toaster />
      {children}
    </ToastContext.Provider>
  );
}
