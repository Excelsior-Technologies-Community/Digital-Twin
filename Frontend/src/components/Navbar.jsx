import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ showBack = false, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-[#FCFAF6]/90 dark:bg-[#151D28]/90 border-b border-[#E5E1D8] dark:border-[#2C3848] backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-[#F3EFE9] dark:bg-[#1E2631] hover:bg-[#E5E1D8] dark:hover:bg-[#2A3644] text-[#1D2B3A] dark:text-[#FCFAF6] transition-colors border border-[#E5E1D8] dark:border-[#384353] flex items-center justify-center shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D2B3A] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1D2B3A] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm shrink-0">
              DT
            </div>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] dark:text-[#FCFAF6] tracking-tight block">
                {title || 'Digital Twin'}
              </span>
              <span className="text-[11px] font-sans text-[#5C5751] dark:text-[#9EA8B6] hidden sm:block -mt-0.5">
                {subtitle || 'Organic Editorial Edition'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate('/')}
            className={`text-xs font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] rounded-full transition-colors flex items-center justify-center ${
              location.pathname === '/' || location.pathname === '/result'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-[#FCFAF6] dark:text-[#1D2B3A]'
                : 'text-[#5C5751] dark:text-[#9EA8B6] hover:text-[#1D2B3A] dark:hover:text-[#FCFAF6] hover:bg-[#F3EFE9] dark:hover:bg-[#1E2631]'
            }`}
          >
            Resume
          </button>

          <button
            onClick={() => navigate('/digital-twin')}
            className={`text-xs font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] rounded-full transition-all flex items-center justify-center gap-1.5 ${
              location.pathname === '/digital-twin'
                ? 'bg-[#B25B3E] text-[#FCFAF6] shadow-sm'
                : 'bg-[#FCFAF6] dark:bg-[#1E2631] text-[#1D2B3A] dark:text-[#FCFAF6] border border-[#E5E1D8] dark:border-[#384353] hover:border-[#1D2B3A] dark:hover:border-[#FCFAF6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B25B3E]" />
            <span><span className="hidden sm:inline">Control </span>Center</span>
          </button>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
