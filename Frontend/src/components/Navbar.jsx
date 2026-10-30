import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function Navbar({ showBack = false, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-[#FCFAF6]/90 border-b border-[#E5E1D8] backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-[#F3EFE9] hover:bg-[#E5E1D8] text-[#1D2B3A] transition-colors border border-[#E5E1D8] flex items-center justify-center shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D2B3A] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm shrink-0">
              DT
            </div>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] tracking-tight block">
                {title || 'Digital Twin'}
              </span>
              <span className="text-[11px] font-sans text-[#5C5751] hidden sm:block -mt-0.5">
                {subtitle || 'Organic Editorial Edition'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate('/')}
            className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${
              location.pathname === '/' || location.pathname === '/result'
                ? 'bg-[#1D2B3A] text-[#FCFAF6]'
                : 'text-[#5C5751] hover:text-[#1D2B3A] hover:bg-[#F3EFE9]'
            }`}
          >
            Resume
          </button>

          <button
            onClick={() => navigate('/digital-twin')}
            className={`text-xs font-medium px-3 sm:px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              location.pathname === '/digital-twin'
                ? 'bg-[#B25B3E] text-white shadow-sm'
                : 'bg-[#FCFAF6] text-[#1D2B3A] border border-[#E5E1D8] hover:border-[#1D2B3A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B25B3E]" />
            <span><span className="hidden sm:inline">Control </span>Center</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
