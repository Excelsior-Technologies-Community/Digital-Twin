import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Box, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const standards = [
    {
      icon: ShieldCheck,
      title: 'Strict PDF Grounding',
      subtitle: 'Zero-hallucination STAR responses'
    },
    {
      icon: Box,
      title: 'Interactive 3D WebGL',
      subtitle: 'Spatial skill architecture explorer'
    },
    {
      icon: FileText,
      title: 'Native A4 Print Engine',
      subtitle: 'Live customizable resume studio'
    }
  ];

  return (
    <footer className="bg-[#FCFAF6] dark:bg-[#1E293B]/70 border-t border-[#E5E1D8] dark:border-[#334155] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xs shadow-xs select-none shrink-0">
                DT
              </div>
              <span className="font-serif font-bold text-base sm:text-lg text-[#1D2B3A] dark:text-white tracking-tight">
                Digital Twin Studio
              </span>
            </div>

            <p className="text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed max-w-sm">
              Transform static PDF resumes into interactive 3D skill architectures and 24/7 AI recruiter personas.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Powered by Gemini AI &amp; WebGL</span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block mb-3.5">
              Navigation
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[#5C5751] dark:text-slate-300 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-[#5C5751] dark:text-slate-300 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#5C5751] dark:text-slate-300 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/studio"
                  className="text-[#5C5751] dark:text-slate-300 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded"
                >
                  Ingestion Studio
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block mb-3.5">
              Architecture &amp; Standards
            </span>
            <div className="space-y-3">
              {standards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] flex items-center justify-center shrink-0 mt-0.5 border border-[#E5E1D8]/60 dark:border-[#334155]/60">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1D2B3A] dark:text-slate-200 block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#5C5751] dark:text-slate-400 block mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C5751] dark:text-slate-400">
          <p>&copy; {currentYear} Digital Twin Studio. All rights reserved.</p>
          <p>Organic Editorial Edition &middot; PDF Grounded</p>
        </div>
      </div>
    </footer>
  );
}
