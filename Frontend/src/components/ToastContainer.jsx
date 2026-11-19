import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />;
    }
  };

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role={item.type === 'error' ? 'alert' : 'status'}
            aria-live={item.type === 'error' ? 'assertive' : 'polite'}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-[#FCFAF6] text-[#1D2B3A] border-[#E5E1D8] dark:bg-[#1E293B] dark:text-gray-100 dark:border-[#334155] backdrop-blur-sm"
          >
            <div className="pt-0.5">{renderIcon(item.type)}</div>
            <div className="flex-1 text-xs font-sans font-medium leading-relaxed break-words">
              {item.message}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg text-[#5C5751] hover:text-[#1D2B3A] dark:text-gray-400 dark:hover:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155] transition-colors shrink-0 -mr-1 -mt-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
