import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
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
  const { toast } = useToast();

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
      const err = 'Please select a valid PDF file (.pdf)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
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
      const err = 'Please enter your full name.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (!file) {
      const err = 'Please upload your PDF resume to initialize your Digital Twin.';
      setErrorMsg(err);
      toast.error(err);
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
        toast.success('Digital Twin activated successfully');
        navigate('/digital-twin', { state: { resumeData: twinData } });
      } else {
        throw new Error(response.data?.message || 'Failed to activate twin');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      let errorMessage = 'An error occurred during upload. Please try again.';

      if (error.response && error.response.data) {
        const backendError = error.response.data.error || error.response.data.message;

        if (backendError && typeof backendError === 'string') {
          const lowerErr = backendError.toLowerCase();
          if (lowerErr.includes('text') || lowerErr.includes('parse') || lowerErr.includes('empty')) {
            errorMessage = "We couldn't extract text from this PDF. Please ensure it's a digital text PDF, not a scanned image.";
          } else {
            errorMessage = backendError;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMsg(errorMessage);
      toast.error(errorMessage);
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
    <div className="min-h-screen bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-gray-100 px-4 sm:px-6 py-4 sm:py-8 flex flex-col font-sans selection:bg-[#B25B3E] selection:text-[#FCFAF6]">
      <header className="max-w-3xl w-full mx-auto mb-6 sm:mb-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1D2B3A] dark:bg-white text-[#FCFAF6] dark:text-[#0F172A] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-xs select-none shrink-0">
            DT
          </div>
          <div className="min-w-0">
            <span className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] dark:text-white tracking-tight block truncate">
              Digital Twin Studio
            </span>
            <span className="text-[11px] sm:text-xs text-[#5C5751] dark:text-gray-400 block -mt-0.5 truncate">
              <span className="hidden sm:inline">Organic Editorial Edition &bull; </span>PDF Grounded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-sans font-semibold tracking-wide text-[#1D2B3A] dark:text-gray-100 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B25B3E]" />
            <span><span className="hidden sm:inline">PDF </span>Ingestion<span className="hidden md:inline"> Engine</span></span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] shadow-md dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-5 sm:p-8 md:p-12 rounded-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] px-3.5 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] mb-4 sm:mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Resume-to-AI Parser
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-[#1D2B3A] dark:text-white font-bold tracking-tight mb-2">
            Initialize Your Digital Proxy
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#5C5751] dark:text-gray-300 leading-relaxed mb-6 sm:mb-8">
            Upload your PDF resume. Our ingestion engine will automatically extract your achievements, project metrics, and technical expertise to ground your 24/7 AI persona.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#B25B3E]/40 flex items-start gap-3 text-xs text-[#B25B3E] dark:text-rose-400 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2 flex items-center gap-1.5"
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
                aria-invalid={!!(errorMsg && !formData.name.trim())}
                className={`w-full rounded-xl px-4 py-3 text-base font-sans transition-all outline-none mb-6 ${
                  errorMsg && !formData.name.trim()
                    ? 'border border-red-500 bg-red-50/60 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-2 focus:ring-red-500/20'
                    : 'bg-[#F3EFE9]/60 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] text-[#1D2B3A] dark:text-white placeholder-[#5C5751]/50 dark:placeholder-slate-400/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20'
                }`}
              />
            </div>

            <div>
              <label className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2 flex items-center gap-1.5">
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
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload PDF Resume"
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                    errorMsg && !file
                      ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20'
                      : isDragging
                      ? 'border-[#B25B3E] bg-[#B25B3E]/5 dark:bg-[#B25B3E]/10'
                      : 'border-[#E5E1D8] dark:border-[#334155] bg-[#FCFAF6] dark:bg-[#0F172A]/60 hover:border-[#1D2B3A]/60 dark:hover:border-gray-400 hover:bg-[#F3EFE9]/50 dark:hover:bg-[#0F172A]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-[#F3EFE9] dark:bg-[#1E293B] border flex items-center justify-center mx-auto mb-3 shadow-2xs transition-all duration-200 ${
                    isDragging ? 'border-[#B25B3E]' : 'border-[#E5E1D8] dark:border-[#334155]'
                  }`}>
                    <UploadCloud className={`w-6 h-6 text-[#B25B3E] transition-transform duration-200 ${isDragging ? 'scale-110' : ''}`} />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#1D2B3A] dark:text-white mb-1">
                    Click to upload your PDF Resume
                  </h3>
                  <p className="text-xs text-[#5C5751] dark:text-gray-400 max-w-sm mx-auto mb-3">
                    Drag and drop your document here, or browse from your device
                  </p>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#5C5751] dark:text-gray-400 bg-[#F3EFE9] dark:bg-[#1E293B] px-2.5 py-1 rounded-md border border-[#E5E1D8] dark:border-[#334155]">
                    Supports PDF up to 10MB
                  </span>
                </div>
              ) : (
                <div className="bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-all shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#1D2B3A] flex items-center justify-center text-[#FCFAF6] shrink-0 shadow-xs">
                      <FileCheck className="w-5 h-5 text-[#FCFAF6]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-serif font-bold text-[#1D2B3A] dark:text-white truncate">
                        {file.name}
                      </h4>
                      <p className="text-xs text-[#5C5751] dark:text-gray-400 flex items-center gap-2">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="text-[#E5E1D8] dark:text-[#334155]">&bull;</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to parse
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      aria-label="Change uploaded resume"
                      className="text-xs font-serif font-semibold text-[#1D2B3A] dark:text-gray-100 hover:text-[#B25B3E] px-3 py-2 min-h-[44px] bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-lg transition-colors shadow-2xs flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      aria-label="Remove uploaded file"
                      className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-[#5C5751] dark:text-gray-400 hover:text-[#B25B3E] hover:bg-[#E5E1D8] dark:hover:bg-[#1E293B] transition-colors flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2.5 flex items-center gap-1.5">
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
                    aria-pressed={formData.tone === tone.label}
                    className={`text-left p-3.5 rounded-xl border transition-all text-xs h-full flex flex-col justify-between min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                      formData.tone === tone.label
                        ? 'bg-[#1D2B3A] text-[#FCFAF6] border-[#1D2B3A] dark:bg-[#334155] dark:text-white dark:border-[#475569] shadow-xs'
                        : 'bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-gray-100 border-[#E5E1D8] dark:border-[#334155] hover:border-[#1D2B3A]/40 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm mb-1 flex items-center justify-between">
                      <span>{tone.label}</span>
                      {formData.tone === tone.label && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                      )}
                    </div>
                    <span className={formData.tone === tone.label ? 'text-[#FCFAF6]/70 dark:text-gray-300' : 'text-[#5C5751] dark:text-gray-400'}>
                      {tone.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="activate-twin-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1D2B3A] dark:bg-[#334155] hover:bg-[#2A3F54] dark:hover:bg-[#475569] disabled:bg-[#1D2B3A]/70 dark:disabled:bg-[#334155]/60 text-[#FCFAF6] dark:text-white font-medium font-sans py-3.5 sm:py-4 min-h-[48px] rounded-xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
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

          <div className="mt-8 pt-6 border-t border-[#E5E1D8] dark:border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-0 text-xs text-[#5C5751] dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B25B3E]" />
              <span>AI-Grounded Executive Synthesis</span>
            </div>
            <div className="flex items-center gap-1.5 font-sans font-medium text-[11px] text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Semantic Extraction Ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
