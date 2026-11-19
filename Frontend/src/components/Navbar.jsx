import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ showBack = false, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isResumeActive = location.pathname === '/' || location.pathname === '/result';
  const isControlActive = location.pathname === '/digital-twin';

  return (
    <header className="bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 border-b border-[#E5E1D8] dark:border-[#334155] backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-[#F3EFE9] dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-[#FCFAF6] transition-colors border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Home"
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] rounded-lg p-0.5"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D2B3A] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1D2B3A] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm shrink-0">
              DT
            </div>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] dark:text-[#FCFAF6] tracking-tight block">
                {title || 'Digital Twin'}
              </span>
              <span className="text-[11px] font-sans text-[#5C5751] dark:text-gray-400 hidden sm:block -mt-0.5">
                {subtitle || 'Organic Editorial Edition'}
              </span>
            </div>
          </button>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate('/')}
            aria-current={isResumeActive ? 'page' : undefined}
            className={`text-xs font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] rounded-full transition-all flex items-center justify-center border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
              isResumeActive
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-[#FCFAF6] dark:text-[#1D2B3A] border-[#B25B3E]'
                : 'text-[#5C5751] dark:text-gray-400 hover:text-[#1D2B3A] dark:hover:text-[#FCFAF6] hover:bg-[#F3EFE9] dark:hover:bg-[#334155] border-transparent'
            }`}
          >
            Resume
          </button>

          <button
            onClick={() => navigate('/digital-twin')}
            aria-current={isControlActive ? 'page' : undefined}
            className={`text-xs font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] rounded-full transition-all flex items-center justify-center gap-1.5 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
              isControlActive
                ? 'bg-[#B25B3E] text-[#FCFAF6] shadow-sm border-[#B25B3E]'
                : 'bg-[#FCFAF6] dark:bg-[#1E293B] text-[#1D2B3A] dark:text-[#FCFAF6] border border-[#E5E1D8] dark:border-[#334155] hover:border-[#1D2B3A] dark:hover:border-[#FCFAF6] border-transparent'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isControlActive ? 'text-[#FCFAF6]' : 'text-[#B25B3E]'}`} />
            <span><span className="hidden sm:inline">Control </span>Center</span>
          </button>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
