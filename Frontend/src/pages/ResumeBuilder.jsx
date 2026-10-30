import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import api from '../services/api';
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

  if (!twinData) return <div className="min-h-[100dvh] bg-[#F3EFE9] flex items-center justify-center p-10 text-center font-serif text-[#5C5751]">Loading Resume Data...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#E5E1D8] flex flex-col md:flex-row font-sans text-[#1D2B3A] overflow-x-hidden pb-24 md:pb-0 relative">
      {/* Sidebar Controls */}
      <div className="hidden md:flex w-full md:w-1/4 bg-[#FCFAF6] p-6 border-r border-[#D4CFC4] shadow-sm flex-col">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] hover:text-[#1D2B3A] transition-colors mb-6 text-left"
        >
          &larr; Back to Dashboard
        </button>
        <h2 className="text-2xl font-serif font-bold text-[#1D2B3A] tracking-tight mb-6">Resume Builder</h2>

        <div className="mb-6">
          <label className="block text-xs font-serif font-bold text-[#5C5751] uppercase tracking-wider mb-3">
            Select Template
          </label>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setTemplate('modern')}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all ${
                template === 'modern'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-[#FCFAF6] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] hover:bg-[#F3EFE9]'
              }`}
            >
              Modern (Dark Theme)
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`py-3 px-4 rounded-xl border text-left font-sans font-medium text-sm transition-all ${
                template === 'classic'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-[#FCFAF6] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] hover:bg-[#F3EFE9]'
              }`}
            >
              Classic (Minimalist)
            </button>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-auto bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] py-3.5 px-4 rounded-xl font-sans font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          Download PDF
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-x-auto overflow-y-auto flex justify-center items-start bg-[#E5E1D8]">
        <div className="origin-top transform transition-transform duration-200 scale-[0.44] sm:scale-[0.65] md:scale-[0.85] lg:scale-100 -mb-[600px] xs:-mb-[550px] sm:-mb-[350px] md:-mb-0">
          <div className="shadow-2xl bg-white overflow-hidden transition-all duration-300" style={{ width: '210mm', minHeight: '297mm' }}>
            {template === 'modern' ? (
              <ModernTemplate data={twinData} ref={resumeRef} />
            ) : (
              <ClassicTemplate data={twinData} ref={resumeRef} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#FCFAF6]/95 backdrop-blur border-t border-[#D4CFC4] flex items-center justify-between gap-3 md:hidden z-40 shadow-lg print:hidden">
        <div className="flex items-center gap-1.5 bg-[#F3EFE9] p-1 rounded-xl border border-[#E5E1D8]">
          <button
            type="button"
            onClick={() => setTemplate('modern')}
            className={`px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
              template === 'modern'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] shadow-xs'
                : 'text-[#5C5751] hover:text-[#1D2B3A]'
            }`}
          >
            Modern
          </button>
          <button
            type="button"
            onClick={() => setTemplate('classic')}
            className={`px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all ${
              template === 'classic'
                ? 'bg-[#1D2B3A] text-[#FCFAF6] shadow-xs'
                : 'text-[#5C5751] hover:text-[#1D2B3A]'
            }`}
          >
            Classic
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] py-2.5 px-4 rounded-xl font-sans font-semibold text-xs shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ResumeBuilder;

