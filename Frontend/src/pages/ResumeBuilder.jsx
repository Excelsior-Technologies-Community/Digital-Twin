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

  if (!twinData) return <div className="p-10 text-center font-sans">Loading Resume Data...</div>;

  return (
    <div className="min-h-screen bg-[#E5E1D8] flex flex-col md:flex-row font-sans text-[#1D2B3A]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/4 bg-[#FCFAF6] p-6 border-r border-[#D4CFC4] shadow-sm flex flex-col">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-8 hover:text-black text-left">
          &larr; Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold mb-6">Resume Builder</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 uppercase tracking-wider">Select Template</label>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setTemplate('modern')}
              className={`py-3 px-4 rounded-xl border text-left font-medium transition-all ${
                template === 'modern'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-[#FCFAF6] shadow-md'
                  : 'border-[#E5E1D8] bg-white hover:bg-gray-50'
              }`}
            >
              Modern (Dark Theme)
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`py-3 px-4 rounded-xl border text-left font-medium transition-all ${
                template === 'classic'
                  ? 'border-[#1D2B3A] bg-[#1D2B3A] text-white shadow-md'
                  : 'border-[#E5E1D8] bg-white hover:bg-gray-50'
              }`}
            >
              Classic (Minimalist)
            </button>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-auto bg-[#1D2B3A] text-[#FCFAF6] py-4 rounded-xl font-bold shadow-lg hover:bg-[#2A3F55] transition-colors"
        >
          Download PDF
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto flex justify-center bg-[#E5E1D8]">
        <div className="shadow-2xl bg-white overflow-hidden transition-all duration-300" style={{ width: '210mm', minHeight: '297mm' }}>
          {template === 'modern' ? (
            <ModernTemplate data={twinData} ref={resumeRef} />
          ) : (
            <ClassicTemplate data={twinData} ref={resumeRef} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

