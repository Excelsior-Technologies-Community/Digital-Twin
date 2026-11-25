import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' }
  ];

  const isStudioActive = location.pathname === '/studio' || location.pathname === '/result';
  const studioButtonStyle = isStudioActive
    ? 'bg-[#9E4D32] shadow-sm ring-2 ring-[#B25B3E]/35 dark:ring-[#E07A5F]/40 ring-offset-2 ring-offset-[#FCFAF6] dark:ring-offset-[#1E293B]'
    : 'bg-[#B25B3E] hover:bg-[#9E4D32] shadow-xs';

  const renderStudioButtonContent = (isMobile = false) => (
    <>
      {isStudioActive && (
        <span
          className={`w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0 ${
            shouldReduceMotion ? '' : 'animate-pulse'
          }`}
          aria-hidden="true"
        />
      )}
      <span>
        {isMobile
          ? isStudioActive
            ? 'In Ingestion Studio'
            : 'Launch Ingestion Studio'
          : isStudioActive
            ? 'In Studio'
            : 'Launch Studio'}
      </span>
      {!isStudioActive && <ArrowRight className={isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
    </>
  );

  return (
    <div className="sticky top-0 z-40 px-4 sm:px-6 pt-3 sm:pt-4">
      <nav
        aria-label="Main Navigation"
        className="max-w-6xl mx-auto rounded-2xl bg-[#FCFAF6]/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-[#E5E1D8]/80 dark:border-[#334155]/80 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-4 transition-colors"
      >
        <Link
          to="/"
          aria-label="Digital Twin Home"
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded-xl p-1 -m-1"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-xs shrink-0 select-none">
            DT
          </div>
          <span className="font-serif font-semibold text-base sm:text-lg text-[#1D2B3A] dark:text-white tracking-tight">
            Digital Twin
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                  isActive
                    ? 'bg-[#1D2B3A]/8 dark:bg-white/10 text-[#1D2B3A] dark:text-white font-semibold'
                    : 'text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link
            to="/studio"
            aria-current={isStudioActive ? 'page' : undefined}
            className={`hidden sm:inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-sans font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${studioButtonStyle}`}
          >
            {renderStudioButtonContent(false)}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-[#1D2B3A] dark:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mt-2 max-w-6xl mx-auto rounded-2xl bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl border border-[#E5E1D8] dark:border-[#334155] shadow-xl p-4 flex flex-col gap-2 md:hidden"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                    isActive
                      ? 'bg-[#1D2B3A]/8 dark:bg-white/10 text-[#1D2B3A] dark:text-white font-semibold'
                      : 'text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white hover:bg-[#E5E1D8]/40 dark:hover:bg-[#334155]/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80">
              <Link
                to="/studio"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isStudioActive ? 'page' : undefined}
                className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-sans font-semibold px-4 py-3 rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${studioButtonStyle}`}
              >
                {renderStudioButtonContent(true)}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
