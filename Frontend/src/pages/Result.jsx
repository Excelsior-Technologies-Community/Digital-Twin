import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  UploadCloud,
  FileText,
  User,
  Sliders,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    tone: 'Professional'
  });

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file (.pdf)');
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const candidateName = formData.name.trim();
    if (!candidateName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!file) {
      setErrorMsg('Please upload your PDF resume to initialize your Digital Twin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', candidateName);
      submitData.append('tone', formData.tone);
      submitData.append('resumePdf', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/twins/create`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data?.success && response.data?.twin) {
        const twinData = response.data.twin;
        localStorage.setItem('activeTwinSlug', twinData.publicSlug || twinData.id);
        navigate('/digital-twin', { state: { resumeData: twinData } });
      } else {
        throw new Error(response.data?.message || 'Failed to activate twin');
      }
    } catch (err) {
      console.error('Error activating Digital Twin:', err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'Error uploading and parsing PDF resume.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toneOptions = [
    { label: 'Professional', desc: 'STAR-method, formal & structured' },
    { label: 'Direct & Technical', desc: 'Architecture & code-focused' },
    { label: 'Confident & Executive', desc: 'Strategic outcomes & leadership' },
    { label: 'Friendly & Conversational', desc: 'Collaborative & approachable' }
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#1D2B3A] p-4 sm:p-8 flex flex-col font-sans selection:bg-[#B25B3E] selection:text-[#FCFAF6]">
      {/* Top Brand Bar */}
      <header className="max-w-3xl w-full mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1D2B3A] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-sm shadow-xs select-none">
            DT
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#1D2B3A] tracking-tight block">
              Digital Twin Studio
            </span>
            <span className="text-xs text-[#5C5751] block -mt-0.5">
              Organic Editorial Edition &bull; PDF Grounded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-serif text-[#1D2B3A] bg-[#FCFAF6] border border-[#E5E1D8] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B25B3E]" />
            PDF Ingestion Engine
          </span>
        </div>
      </header>

      {/* Main Dynamic PDF Setup Card */}
      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="bg-[#FCFAF6] border border-[#E5E1D8] shadow-sm p-8 md:p-12 rounded-2xl relative overflow-hidden">
          {/* Decorative Corner Pill */}
          <div className="inline-flex items-center gap-2 bg-[#F3EFE9] border border-[#E5E1D8] px-3.5 py-1 rounded-full text-xs font-serif font-bold text-[#B25B3E] mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Resume-to-AI Parser
          </div>

          {/* Editorial Header */}
          <h1 className="font-serif text-3xl md:text-4xl text-[#1D2B3A] font-bold tracking-tight mb-2">
            Initialize Your Digital Proxy
          </h1>
          <p className="text-sm md:text-base text-[#5C5751] leading-relaxed mb-8">
            Upload your PDF resume. Our ingestion engine will automatically extract your achievements, project metrics, and technical expertise to ground your 24/7 AI persona.
          </p>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#F3EFE9] border border-[#B25B3E]/40 flex items-start gap-3 text-xs text-[#B25B3E] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate Name Input */}
            <div>
              <label
                htmlFor="name"
                className="text-xs font-serif font-bold text-[#5C5751] uppercase tracking-wider block mb-1 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#B25B3E]" />
                Full Candidate Name <span className="text-[#B25B3E]">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Manav Patel"
                disabled={isSubmitting}
                required
                className="w-full bg-transparent border-b border-[#E5E1D8] focus:border-[#1D2B3A] outline-none py-2 text-[#1D2B3A] font-sans mb-6 transition-colors text-base placeholder-[#5C5751]/40"
              />
            </div>

            {/* Sleek PDF File Upload Zone */}
            <div>
              <label className="text-xs font-serif font-bold text-[#5C5751] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B25B3E]" />
                Upload PDF Resume <span className="text-[#B25B3E]">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
                id="resume-pdf-upload"
              />

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#1D2B3A] bg-[#F3EFE9]'
                      : 'border-[#E5E1D8] bg-[#FCFAF6] hover:border-[#1D2B3A]/60 hover:bg-[#F3EFE9]/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE9] border border-[#E5E1D8] flex items-center justify-center text-[#B25B3E] mx-auto mb-3 shadow-2xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#1D2B3A] mb-1">
                    Click to upload your PDF Resume
                  </h3>
                  <p className="text-xs text-[#5C5751] max-w-sm mx-auto mb-3">
                    Drag and drop your document here, or browse from your device
                  </p>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#5C5751] bg-[#F3EFE9] px-2.5 py-1 rounded-md border border-[#E5E1D8]">
                    Supports PDF up to 10MB
                  </span>
                </div>
              ) : (
                <div className="bg-[#F3EFE9] border border-[#E5E1D8] rounded-2xl p-5 flex items-center justify-between gap-4 transition-all shadow-2xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1D2B3A] flex items-center justify-center text-[#FCFAF6] shrink-0 shadow-xs">
                      <FileCheck className="w-5 h-5 text-[#EFE8DD]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-serif font-bold text-[#1D2B3A] truncate">
                        {file.name}
                      </h4>
                      <p className="text-xs text-[#5C5751] flex items-center gap-2">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="text-[#E5E1D8]">&bull;</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to parse
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="text-xs font-serif font-semibold text-[#1D2B3A] hover:text-[#B25B3E] px-3 py-1.5 bg-[#FCFAF6] border border-[#E5E1D8] rounded-lg transition-colors shadow-2xs"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      className="p-1.5 rounded-lg text-[#5C5751] hover:text-[#B25B3E] hover:bg-[#E5E1D8] transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Speaking Tone Selector */}
            <div className="pt-2">
              <label className="text-xs font-serif font-bold text-[#5C5751] uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#B25B3E]" />
                Speaking Persona Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.label}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setFormData((prev) => ({ ...prev, tone: tone.label }))}
                    className={`text-left p-3.5 rounded-xl border transition-all text-xs ${
                      formData.tone === tone.label
                        ? 'bg-[#1D2B3A] text-[#FCFAF6] border-[#1D2B3A] shadow-xs'
                        : 'bg-[#F3EFE9] text-[#1D2B3A] border-[#E5E1D8] hover:border-[#1D2B3A]/40'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm mb-0.5 flex items-center justify-between">
                      <span>{tone.label}</span>
                      {formData.tone === tone.label && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B25B3E]" />
                      )}
                    </div>
                    <span className={formData.tone === tone.label ? 'text-[#FCFAF6]/70' : 'text-[#5C5751]'}>
                      {tone.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="activate-twin-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1D2B3A] hover:bg-[#2A3F54] disabled:bg-[#1D2B3A]/70 text-[#FCFAF6] font-medium font-sans py-3.5 rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Parsing PDF & Activating Twin...</span>
                </>
              ) : (
                <>
                  <span>Activate Digital Twin</span>
                  <ArrowRight className="w-4 h-4 text-[#B25B3E]" />
                </>
              )}
            </button>
          </form>

          {/* Grounding Telemetry Callout */}
          <div className="mt-8 pt-6 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#5C5751]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B25B3E]" />
              <span>Grounded in Google Gemini AI & MySQL</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>pdf-parse Active</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
