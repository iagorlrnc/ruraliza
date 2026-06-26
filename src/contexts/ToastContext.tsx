import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastContextType {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgColor = 'bg-white border-green-200 text-green-800';
            let Icon = CheckCircle;
            let iconColor = 'text-green-500';

            if (t.type === 'error') {
              bgColor = 'bg-white border-red-200 text-red-800';
              Icon = AlertCircle;
              iconColor = 'text-red-500';
            } else if (t.type === 'info') {
              bgColor = 'bg-white border-blue-200 text-blue-800';
              Icon = Info;
              iconColor = 'text-blue-500';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} pointer-events-auto backdrop-blur-md bg-opacity-95`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 text-sm font-medium">{t.text}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg hover:bg-gray-100 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
