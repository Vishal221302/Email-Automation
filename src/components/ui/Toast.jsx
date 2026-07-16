import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title, message, duration) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title, message, duration) => {
    addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title, message, duration) => {
    addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title, message, duration) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const iconMap = {
              success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
              error: <XCircle className="w-5 h-5 text-danger shrink-0" />,
              info: <Info className="w-5 h-5 text-primary shrink-0" />
            };

            const borderMap = {
              success: 'border-success/30 dark:border-success/20',
              warning: 'border-warning/30 dark:border-warning/20',
              error: 'border-danger/30 dark:border-danger/20',
              info: 'border-primary/30 dark:border-primary/20'
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex gap-3 p-4 rounded-card border shadow-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 ${borderMap[toast.type]}`}
              >
                {iconMap[toast.type]}
                <div className="flex-1 flex flex-col gap-0.5 text-left">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer self-start"
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
