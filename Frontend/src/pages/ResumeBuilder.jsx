import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ModernTemplate from '../components/templates/ModernTemplate';
import ClassicTemplate from '../components/templates/ClassicTemplate';

const ResumeBuilder = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [twinData, setTwinData] = useState(null);
  const [template, setTemplate] = useState('modern');
  const resumeRef = useRef();

  useEffect(() => {
    const fetchTwinData = async () => {
      try {
        // Use configured api service, falling back to direct axios call
        const response = await api.get(`/twins/${slug}`).catch(() => axios.get(`/api/twins/${slug}`));
        const data = response.data?.twin || response.data;
        setTwinData(data);
      } catch (error) {
        console.error('Error fetching twin data for resume:', error);
      }
    };
    if (slug) fetchTwinData();
  }, [slug]);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    content: () => resumeRef.current,
    documentTitle: `${twinData?.name || 'Resume'}_Digital_Twin`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  if (!twinData) return <div className="min-h-[100dvh] bg-[#F3EFE9] dark:bg-[#0B1120] flex items-center justify-center p-10 text-center font-serif text-[#5C5751] dark:text-gray-400">Loading Resume Data...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#E5E1D8] dark:bg-[#0B1120] flex flex-col md:flex-row font-sans text-[#1D2B3A] dark:text-gray-100 overflow-x-hidden pb-24 md:pb-0 relative transition-colors">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur border-b border-[#D4CFC4] dark:border-[#334155] sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors min-h-[36px]"
        >
          &larr; Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-xs text-[#1D2B3A] dark:text-white uppercase tracking-wider">
            Resume Builder
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="hidden md:flex w-full md:w-1/4 bg-[#FCFAF6] dark:bg-[#1E293B] p-6 border-r border-[#D4CFC4] dark:border-[#334155] shadow-sm flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors text-left"
          >
            &larr; Back to Dashboard
          </button>
          <ThemeToggle />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight mb-6">Resume Builder</h2>

        <div className="mb-6">
          <label className="block text-xs font-serif font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider mb-3">
            Select Template
          </label>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setTemplate('modern')}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all ${
                template === 'modern'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-[#FCFAF6] dark:border-white dark:bg-white dark:text-[#0F172A] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200 hover:bg-[#F3EFE9] dark:hover:bg-[#1E293B]'
              }`}
            >
              Modern (Dark Theme)
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all ${
                template === 'classic'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-[#FCFAF6] dark:border-white dark:bg-white dark:text-[#0F172A] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-200 hover:bg-[#F3EFE9] dark:hover:bg-[#1E293B]'
              }`}
            >
              Classic (Minimalist)
            </button>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-auto bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-3.5 px-4 rounded-xl font-sans font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          Download PDF
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="w-full md:w-3/4 p-3 sm:p-4 md:p-8 overflow-x-auto overflow-y-auto flex justify-center items-start bg-[#E5E1D8] dark:bg-[#0B1120]">
        <div className="origin-top transform transition-transform duration-200 scale-[0.44] sm:scale-[0.65] md:scale-[0.85] lg:scale-100 -mb-[600px] xs:-mb-[550px] sm:-mb-[350px] md:-mb-0">
          <div className="shadow-2xl bg-white text-gray-900 overflow-hidden transition-all duration-300" style={{ width: '210mm', minHeight: '297mm' }}>
            {template === 'modern' ? (
              <ModernTemplate data={twinData} ref={resumeRef} />
            ) : (
              <ClassicTemplate data={twinData} ref={resumeRef} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur border-t border-[#D4CFC4] dark:border-[#334155] flex items-center justify-between gap-3 md:hidden z-40 shadow-lg print:hidden">
        <div className="flex items-center gap-1.5 bg-[#F3EFE9] dark:bg-[#0F172A] p-1 rounded-xl border border-[#E5E1D8] dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setTemplate('modern')}
            className={`min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
              template === 'modern'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] shadow-xs'
                : 'text-[#5C5751] dark:text-gray-400 hover:text-[#1D2B3A] dark:hover:text-white'
            }`}
          >
            Modern
          </button>
          <button
            type="button"
            onClick={() => setTemplate('classic')}
            className={`min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
              template === 'classic'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] shadow-xs'
                : 'text-[#5C5751] dark:text-gray-400 hover:text-[#1D2B3A] dark:hover:text-white'
            }`}
          >
            Classic
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-2.5 px-4 rounded-xl font-sans font-semibold text-xs shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ResumeBuilder;

