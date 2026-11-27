import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MarketingLayout({ children, transparentNav = false }) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip flex flex-col bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 transition-colors duration-200 selection:bg-[#B25B3E] selection:text-[#FCFAF6]">
      <Navbar transparent={transparentNav} />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
