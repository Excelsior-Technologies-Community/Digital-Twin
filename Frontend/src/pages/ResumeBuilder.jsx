import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { Check } from 'lucide-react';
import ModernTemplate from '../components/templates/ModernTemplate';
import ClassicTemplate from '../components/templates/ClassicTemplate';

const ResumeBuilder = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [twinData, setTwinData] = useState(null);
  const [template, setTemplate] = useState('modern');
  const resumeRef = useRef();

  useEffect(() => {
    const fetchTwinData = async () => {
      try {
        const response = await api.get(`/twins/${slug}`).catch(() => axios.get(`/api/twins/${slug}`));
        const data = response.data?.twin || response.data;
        if (data) {
          setTwinData(data);
        } else {
          throw new Error('Resume data not found');
        }
      } catch (error) {
        console.error('Error fetching twin data for resume:', error);
        toast.error('Failed to load resume data. Please try again.');
      }
    };
    if (slug) fetchTwinData();
  }, [slug]);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
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
    onAfterPrint: () => {
      toast.success('Resume PDF generated successfully');
    },
    onPrintError: () => {
      toast.error('Failed to generate resume PDF. Please try again.');
    }
  });

  const onDownloadClick = () => {
    if (!twinData) {
      toast.error('Resume data is still loading.');
      return;
    }
    toast.info('Preparing PDF document...');
    handlePrint();
  };

  if (!twinData) return <div className="min-h-[100dvh] bg-[#F3EFE9] dark:bg-[#0F172A] flex items-center justify-center p-10 text-center font-serif text-[#5C5751] dark:text-gray-400">Loading Resume Data...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#E5E1D8] dark:bg-[#0F172A] flex flex-col md:flex-row font-sans text-[#1D2B3A] dark:text-gray-100 overflow-x-hidden pb-24 md:pb-0 relative transition-colors">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur border-b border-[#D4CFC4] dark:border-[#334155] sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back to Dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] rounded-lg"
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
      <div className="hidden md:flex w-full md:w-1/4 bg-[#FCFAF6] dark:bg-[#1E293B] p-6 border-r border-[#D4CFC4] dark:border-[#334155] shadow-md flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back to Dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] rounded-lg"
          >
            &larr; Back to Dashboard
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight mb-6">Resume Builder</h1>

        <div className="mb-6">
          <label className="block text-xs font-serif font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider mb-3">
            Select Template
          </label>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setTemplate('modern')}
              aria-pressed={template === 'modern'}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all duration-150 hover:scale-[1.03] flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                template === 'modern'
                  ? 'border-[#B25B3E] ring-2 ring-[#B25B3E]/60 bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-100 hover:bg-[#F3EFE9] dark:hover:bg-[#1E293B]'
              }`}
            >
              <span>Modern (Dark Theme)</span>
              {template === 'modern' && <Check className="w-4 h-4 text-[#B25B3E] shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => setTemplate('classic')}
              aria-pressed={template === 'classic'}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all duration-150 hover:scale-[1.03] flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                template === 'classic'
                  ? 'border-[#B25B3E] ring-2 ring-[#B25B3E]/60 bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-100 hover:bg-[#F3EFE9] dark:hover:bg-[#1E293B]'
              }`}
            >
              <span>Classic (Minimalist)</span>
              {template === 'classic' && <Check className="w-4 h-4 text-[#B25B3E] shrink-0" />}
            </button>
          </div>
        </div>

        <button
          onClick={onDownloadClick}
          className="mt-auto bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-3.5 px-4 rounded-xl font-sans font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
        >
          Download PDF
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="w-full md:w-3/4 p-4 sm:p-6 md:p-8 overflow-x-auto overflow-y-auto flex justify-center items-start bg-[#E5E1D8] dark:bg-[#0F172A]">
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
            aria-pressed={template === 'modern'}
            className={`min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-150 hover:scale-[1.03] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
              template === 'modern'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] ring-2 ring-[#B25B3E]/60 shadow-xs'
                : 'text-[#5C5751] dark:text-gray-400 hover:text-[#1D2B3A] dark:hover:text-white'
            }`}
          >
            {template === 'modern' && <Check className="w-3.5 h-3.5 text-[#B25B3E] shrink-0" />}
            <span>Modern</span>
          </button>
          <button
            type="button"
            onClick={() => setTemplate('classic')}
            aria-pressed={template === 'classic'}
            className={`min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-150 hover:scale-[1.03] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
              template === 'classic'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] ring-2 ring-[#B25B3E]/60 shadow-xs'
                : 'text-[#5C5751] dark:text-gray-400 hover:text-[#1D2B3A] dark:hover:text-white'
            }`}
          >
            {template === 'classic' && <Check className="w-3.5 h-3.5 text-[#B25B3E] shrink-0" />}
            <span>Classic</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDownloadClick}
          className="flex-1 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-2.5 px-4 rounded-xl font-sans font-semibold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ResumeBuilder;

