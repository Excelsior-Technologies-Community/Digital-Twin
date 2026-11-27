import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

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
      className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 z-50 flex flex-col items-stretch sm:items-end gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-sm sm:w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role={item.type === 'error' ? 'alert' : 'status'}
            aria-live={item.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className="pointer-events-auto relative overflow-hidden w-full flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-[#FCFAF6] text-[#1D2B3A] border-[#E5E1D8] dark:bg-[#1E293B] dark:text-gray-100 dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm"
          >
            <div className="pt-0.5">{renderIcon(item.type)}</div>
            <div className="flex-1 text-xs font-sans font-medium leading-relaxed break-words">
              {item.message}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#5C5751] hover:text-[#1D2B3A] dark:text-gray-400 dark:hover:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155] transition-colors shrink-0 -mr-1.5 -mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {!shouldReduceMotion && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (item.duration || 3500) / 1000, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B25B3E]/70 dark:bg-[#E07A5F]"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
