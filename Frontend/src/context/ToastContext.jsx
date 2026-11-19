import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((messageOrObj, typeParam = 'info', durationParam = 3500) => {
    const message = typeof messageOrObj === 'object' ? messageOrObj.message : messageOrObj;
    const type = typeof messageOrObj === 'object' ? (messageOrObj.type || 'info') : typeParam;
    const duration = typeof messageOrObj === 'object' ? (messageOrObj.duration || 3500) : durationParam;

    if (!message) return;

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    setToasts((prev) => {
      const next = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
      return [...next, { id, message, type, duration }];
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  const toast = {
    success: useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]),
    error: useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]),
    info: useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast])
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
