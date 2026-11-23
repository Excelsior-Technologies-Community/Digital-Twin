import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { Check, Printer, ChevronDown, RotateCcw, Pencil, Plus, X } from 'lucide-react';
import ModernTemplate from '../components/templates/ModernTemplate';
import ClassicTemplate from '../components/templates/ClassicTemplate';

const ACCENT_PALETTES = [
  { id: 'slate', name: 'Executive Slate', hex: '#1D2B3A' },
  { id: 'terracotta', name: 'Terracotta Studio', hex: '#B25B3E' },
  { id: 'emerald', name: 'Emerald Tech', hex: '#047857' },
  { id: 'charcoal', name: 'Charcoal Minimalist', hex: '#334155' }
];

const parseSkills = (rawSkills) => {
  if (Array.isArray(rawSkills)) return rawSkills.map((s) => String(s).trim()).filter(Boolean);
  if (typeof rawSkills === 'string') {
    try {
      const parsed = JSON.parse(rawSkills);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (_) {}
    return rawSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const ResumeBuilder = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [twinData, setTwinData] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [zoomMode, setZoomMode] = useState('fit');
  const [accentColor, setAccentColor] = useState('#1D2B3A');
  const [openAccordion, setOpenAccordion] = useState('summary');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const [editedSummary, setEditedSummary] = useState('');
  const [editedSkills, setEditedSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [availableWidth, setAvailableWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return Math.min(794, Math.max(260, window.innerWidth - 48));
    }
    return 794;
  });
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined') return window.innerHeight;
    return 900;
  });
  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1200;
  });
  const [sheetHeight, setSheetHeight] = useState(1123);

  const stageRef = useRef(null);
  const resumeRef = useRef(null);

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

  useEffect(() => {
    if (twinData) {
      const initialBio = twinData.bio || twinData.summary || twinData.parsedResume?.summary || twinData.parsedResume?.bio || '';
      const initialSkillsList = parseSkills(twinData.skills || twinData.parsedResume?.skills || []);
      setEditedSummary(initialBio);
      setEditedSkills(initialSkillsList);
    }
  }, [twinData]);

  const originalSummary = useMemo(() => {
    return twinData?.bio || twinData?.summary || twinData?.parsedResume?.summary || twinData?.parsedResume?.bio || '';
  }, [twinData]);

  const originalSkills = useMemo(() => {
    return parseSkills(twinData?.skills || twinData?.parsedResume?.skills || []);
  }, [twinData]);

  const hasEdits = useMemo(() => {
    if (!twinData) return false;
    if (editedSummary !== originalSummary) return true;
    if (editedSkills.length !== originalSkills.length) return true;
    return editedSkills.some((s, idx) => s !== originalSkills[idx]);
  }, [twinData, editedSummary, editedSkills, originalSummary, originalSkills]);

  const handleResetEdits = () => {
    setEditedSummary(originalSummary);
    setEditedSkills(originalSkills);
    setNewSkillInput('');
    toast.success('Reset resume customizations to original');
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!editedSkills.includes(trimmed)) {
      setEditedSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setEditedSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const effectiveResumeData = useMemo(() => {
    if (!twinData) return null;
    return {
      ...twinData,
      bio: editedSummary,
      summary: editedSummary,
      skills: editedSkills,
      parsedResume: twinData.parsedResume
        ? {
            ...twinData.parsedResume,
            bio: editedSummary,
            summary: editedSummary,
            skills: editedSkills,
          }
        : undefined,
    };
  }, [twinData, editedSummary, editedSkills]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateMeasurements = () => {
      if (stageRef.current) {
        const width = stageRef.current.clientWidth;
        if (width > 0) setAvailableWidth(width);
      }
      if (resumeRef.current) {
        const height = resumeRef.current.offsetHeight || resumeRef.current.scrollHeight;
        if (height > 0) setSheetHeight(height);
      }
      if (typeof window !== 'undefined') {
        setViewportHeight(window.innerHeight);
        setViewportWidth(window.innerWidth);
      }
    };

    updateMeasurements();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === stage) {
          const width = entry.contentRect.width;
          if (width > 0) setAvailableWidth(width);
        } else if (entry.target === resumeRef.current) {
          const height = resumeRef.current?.offsetHeight || entry.contentRect.height;
          if (height > 0) setSheetHeight(height);
        }
      }
    });

    observer.observe(stage);
    if (resumeRef.current) {
      observer.observe(resumeRef.current);
    }

    const handleResize = () => {
      updateMeasurements();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [twinData, template, effectiveResumeData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEditDrawerOpen) {
        setIsEditDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditDrawerOpen]);

  const isMobile = viewportWidth < 768;
  const isDesktopOrTablet = !isMobile;
  const widthScale = availableWidth / 794;

  let fitScale;
  if (isDesktopOrTablet) {
    const stageTop = stageRef.current
      ? (stageRef.current.getBoundingClientRect().top + (window.scrollY || 0))
      : 140;
    const availableHeight = Math.max(320, viewportHeight - Math.max(stageTop, 140) - 32);
    const heightScale = availableHeight / (sheetHeight || 1123);
    fitScale = Math.min(1, Math.max(0.35, Math.min(widthScale, heightScale)));
  } else {
    fitScale = Math.min(1, Math.max(0.35, widthScale));
  }

  const activeScale = isMobile
    ? fitScale
    : zoomMode === '75'
      ? 0.75
      : zoomMode === '100'
        ? 1
        : fitScale;

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${effectiveResumeData?.name || 'Resume'}_Digital_Twin`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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

  const toggleAccordion = (sectionId) => {
    setOpenAccordion((prev) => (prev === sectionId ? null : sectionId));
  };

  if (!twinData) return <div className="min-h-[100dvh] bg-[#F3EFE9] dark:bg-[#0F172A] flex items-center justify-center p-10 text-center font-serif text-[#5C5751] dark:text-gray-400">Loading Resume Data...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#E5E1D8] dark:bg-[#0F172A] flex flex-col md:flex-row font-sans text-[#1D2B3A] dark:text-gray-100 overflow-x-hidden pb-28 md:pb-0 relative transition-colors">
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur border-b border-[#D4CFC4] dark:border-[#334155] sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back to Dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] rounded-lg shrink-0"
        >
          &larr; Back to Dashboard
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-serif font-bold text-xs text-[#1D2B3A] dark:text-white uppercase tracking-wider hidden xs:inline">
            Resume Builder
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-[320px] lg:w-[360px] bg-[#FCFAF6] dark:bg-[#1E293B] p-5 lg:p-6 border-r border-[#D4CFC4] dark:border-[#334155] shadow-md flex-col shrink-0 overflow-y-auto max-h-[100dvh]">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back to Dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] rounded-lg"
          >
            &larr; Back to Dashboard
          </button>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight">Resume Builder</h1>
          {hasEdits && (
            <button
              type="button"
              onClick={handleResetEdits}
              title="Reset to Original"
              aria-label="Reset to Original"
              className="inline-flex items-center gap-1 text-xs font-sans font-medium text-[#B25B3E] hover:text-[#9A4E35] dark:text-[#E07A5F] dark:hover:text-[#F4A261] transition-colors py-1 px-2 rounded-lg hover:bg-[#F3EFE9] dark:hover:bg-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-sans font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider mb-2.5">
            Select Template
          </label>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setTemplate('modern')}
              aria-pressed={template === 'modern'}
              className={`py-2.5 px-3.5 rounded-xl border text-left font-sans font-medium text-xs transition-all duration-150 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                template === 'modern'
                  ? 'border-[#B25B3E] ring-2 ring-[#B25B3E]/60 bg-[#1D2B3A] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] shadow-sm'
                  : 'border-[#E5E1D8] bg-[#FCFAF6] text-[#1D2B3A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-100 hover:bg-[#F3EFE9] dark:hover:bg-[#1E293B]'
              }`}
            >
              <span>Modern (Executive Theme)</span>
              {template === 'modern' && <Check className="w-4 h-4 text-[#B25B3E] shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => setTemplate('classic')}
              aria-pressed={template === 'classic'}
              className={`py-2.5 px-3.5 rounded-xl border text-left font-sans font-medium text-xs transition-all duration-150 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
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

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/50 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3 transition-colors">
            <button
              type="button"
              onClick={() => toggleAccordion('summary')}
              aria-expanded={openAccordion === 'summary'}
              className="w-full flex items-center justify-between text-left font-sans font-bold text-xs text-[#5C5751] dark:text-gray-400 uppercase tracking-wider py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded-md"
            >
              <span>Executive Summary</span>
              <ChevronDown
                className={`w-4 h-4 text-[#5C5751] dark:text-slate-400 transition-transform duration-200 ${
                  openAccordion === 'summary' ? 'rotate-180 text-[#B25B3E]' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openAccordion === 'summary' && (
                <motion.div
                  key="summary-content"
                  initial={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-2.5 pb-0.5">
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      placeholder="Write a concise executive summary..."
                      rows={4}
                      className="w-full min-h-[110px] resize-y bg-[#FCFAF6] dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3 text-xs leading-relaxed text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#5C5751]/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20 outline-none transition-all font-sans"
                    />
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="font-sans text-[11px] text-[#5C5751] dark:text-slate-400">
                        {editedSummary.length} characters
                      </span>
                      {editedSummary !== originalSummary && (
                        <button
                          type="button"
                          onClick={() => setEditedSummary(originalSummary)}
                          className="font-sans text-[11px] text-[#B25B3E] hover:underline"
                        >
                          Revert
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/50 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3 transition-colors">
            <button
              type="button"
              onClick={() => toggleAccordion('highlights')}
              aria-expanded={openAccordion === 'highlights'}
              className="w-full flex items-center justify-between text-left font-sans font-bold text-xs text-[#5C5751] dark:text-gray-400 uppercase tracking-wider py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded-md"
            >
              <span>Highlights & Skills</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#E5E1D8] dark:bg-[#334155] text-[#1D2B3A] dark:text-slate-200">
                  {editedSkills.length}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#5C5751] dark:text-slate-400 transition-transform duration-200 ${
                    openAccordion === 'highlights' ? 'rotate-180 text-[#B25B3E]' : ''
                  }`}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openAccordion === 'highlights' && (
                <motion.div
                  key="highlights-content"
                  initial={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-2.5 pb-0.5 space-y-2.5">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSkill();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="Add skill or highlight..."
                        className="flex-1 min-w-0 bg-[#FCFAF6] dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl px-3 py-2 text-xs text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#5C5751]/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20 outline-none transition-all font-sans"
                      />
                      <button
                        type="submit"
                        disabled={!newSkillInput.trim()}
                        aria-label="Add Skill"
                        className="bg-[#1D2B3A] hover:bg-[#2A3F55] text-white dark:bg-[#B25B3E] dark:hover:bg-[#9A4E35] disabled:opacity-40 disabled:pointer-events-none p-2 rounded-xl transition-all duration-150 ease-out hover:scale-105 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {editedSkills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="bg-[#FCFAF6] dark:bg-[#0F172A]/80 border border-[#E5E1D8] dark:border-[#334155] text-[#1D2B3A] dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-sans inline-flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[130px]">{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
                            aria-label={`Remove ${skill}`}
                            className="text-[#5C5751] hover:text-[#B25B3E] dark:text-slate-400 dark:hover:text-[#E07A5F] transition-colors p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {editedSkills.length === 0 && (
                        <p className="text-xs text-[#5C5751] dark:text-slate-400 italic py-1">
                          No skills added yet. Add some above.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/50 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3 transition-colors">
            <button
              type="button"
              onClick={() => toggleAccordion('palette')}
              aria-expanded={openAccordion === 'palette'}
              className="w-full flex items-center justify-between text-left font-sans font-bold text-xs text-[#5C5751] dark:text-gray-400 uppercase tracking-wider py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] rounded-md"
            >
              <span>Accent Palette</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                  style={{ backgroundColor: accentColor }}
                  title={ACCENT_PALETTES.find((p) => p.hex === accentColor)?.name}
                />
                <ChevronDown
                  className={`w-4 h-4 text-[#5C5751] dark:text-slate-400 transition-transform duration-200 ${
                    openAccordion === 'palette' ? 'rotate-180 text-[#B25B3E]' : ''
                  }`}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openAccordion === 'palette' && (
                <motion.div
                  key="palette-content"
                  initial={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: shouldReduceMotion ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-2.5 pb-0.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans font-medium text-[#5C5751] dark:text-slate-400">
                        Selected Palette
                      </span>
                      <span className="text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-200">
                        {ACCENT_PALETTES.find((p) => p.hex === accentColor)?.name || 'Custom'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      {ACCENT_PALETTES.map((palette) => {
                        const isSelected = accentColor === palette.hex;
                        return (
                          <button
                            key={palette.id}
                            type="button"
                            onClick={() => setAccentColor(palette.hex)}
                            aria-label={palette.name}
                            title={palette.name}
                            aria-pressed={isSelected}
                            style={{ backgroundColor: palette.hex }}
                            className={`w-8 h-8 rounded-full transition-all duration-150 ease-out hover:scale-110 active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] relative ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-[#B25B3E] dark:ring-offset-[#1E293B] shadow-sm'
                                : 'opacity-90 hover:opacity-100 ring-1 ring-black/10 dark:ring-white/10'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={onDownloadClick}
          className="bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-3.5 px-4 rounded-xl font-sans font-semibold text-sm shadow-md transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
        >
          Download PDF
        </button>

        <div className="mt-3 bg-[#F3EFE9]/80 dark:bg-[#0F172A]/75 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#5C5751] dark:text-slate-300 print:hidden border border-[#E5E1D8]/60 dark:border-[#334155]/60">
          <Printer className="w-4 h-4 shrink-0 text-[#B25B3E] dark:text-[#E07A5F] mt-0.5" />
          <span className="leading-relaxed">
            Recommended print setting: Margins: None & Background Graphics: Enabled
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col items-center bg-[#E5E1D8] dark:bg-[#0F172A] p-3 sm:p-6 md:p-8 min-h-0 print:p-0 print:bg-white print:w-full">
        <div className="w-full flex items-center justify-center gap-2.5 mb-2 sm:mb-4 print:hidden px-2 sm:px-4">
          <div className="hidden md:inline-flex bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-1 items-center gap-1 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={() => setZoomMode('fit')}
              aria-pressed={zoomMode === 'fit'}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                zoomMode === 'fit'
                  ? 'bg-[#1D2B3A] text-white dark:bg-[#B25B3E] dark:text-white shadow-xs'
                  : 'text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white'
              }`}
            >
              Fit Page
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('75')}
              aria-pressed={zoomMode === '75'}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                zoomMode === '75'
                  ? 'bg-[#1D2B3A] text-white dark:bg-[#B25B3E] dark:text-white shadow-xs'
                  : 'text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white'
              }`}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('100')}
              aria-pressed={zoomMode === '100'}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                zoomMode === '100'
                  ? 'bg-[#1D2B3A] text-white dark:bg-[#B25B3E] dark:text-white shadow-xs'
                  : 'text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white'
              }`}
            >
              100%
            </button>
          </div>

          <span className="hidden md:inline-block text-xs font-sans font-semibold text-[#5C5751] dark:text-slate-400 tabular-nums px-2.5 py-1 rounded-lg bg-[#FCFAF6]/80 dark:bg-[#1E293B]/80 border border-[#E5E1D8] dark:border-[#334155] shadow-xs">
            {Math.round(activeScale * 100)}%
          </span>

          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-1 shadow-xs">
              {ACCENT_PALETTES.map((palette) => {
                const isSelected = accentColor === palette.hex;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setAccentColor(palette.hex)}
                    aria-label={palette.name}
                    title={palette.name}
                    aria-pressed={isSelected}
                    style={{ backgroundColor: palette.hex }}
                    className={`w-6 h-6 rounded-full transition-all duration-150 ease-out hover:scale-110 active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#B25B3E] ${
                      isSelected ? 'ring-2 ring-offset-1 ring-[#B25B3E]' : 'opacity-85'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsEditDrawerOpen(true)}
              aria-label="Edit Resume Content"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-xl text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-200 shadow-xs hover:border-[#B25B3E] transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#B25B3E]" />
              <span>Edit</span>
              {hasEdits && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B25B3E]" />
              )}
            </button>
          </div>
        </div>

        <div
          ref={stageRef}
          className="w-full min-w-0 overflow-x-auto py-4 sm:py-6 flex justify-center print:p-0 print:overflow-visible"
        >
          <div
            className="relative print:!w-auto print:!h-auto shrink-0 transition-[width,height] duration-200"
            style={{
              width: `${Math.round(794 * activeScale)}px`,
              height: `${Math.round(sheetHeight * activeScale)}px`,
            }}
          >
            <div
              className="origin-top-left transform-gpu transition-transform duration-200 print:!transform-none shadow-2xl print:shadow-none bg-white text-gray-900"
              style={{
                transform: `scale(${activeScale})`,
                width: '794px',
              }}
            >
              {template === 'modern' ? (
                <ModernTemplate data={effectiveResumeData} accentColor={accentColor} ref={resumeRef} />
              ) : (
                <ClassicTemplate data={effectiveResumeData} accentColor={accentColor} ref={resumeRef} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur border-t border-[#D4CFC4] dark:border-[#334155] flex items-center justify-between gap-3 md:hidden z-40 shadow-lg print:hidden">
        <div className="flex items-center gap-1.5 bg-[#F3EFE9] dark:bg-[#0F172A] p-1 rounded-xl border border-[#E5E1D8] dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setTemplate('modern')}
            aria-pressed={template === 'modern'}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 ease-out hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
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
            className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 ease-out hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
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
          className="flex-1 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 py-2.5 px-4 rounded-xl font-sans font-semibold text-xs shadow-md transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
        >
          Download PDF
        </button>
      </div>

      <AnimatePresence>
        {isEditDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end print:hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              onClick={() => setIsEditDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#FCFAF6] dark:bg-[#1E293B] h-full shadow-2xl flex flex-col z-10 border-l border-[#D4CFC4] dark:border-[#334155]"
            >
              <div className="p-4 sm:p-5 border-b border-[#E5E1D8] dark:border-[#334155] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#B25B3E]" />
                  <h2 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                    Quick Edit Resume
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {hasEdits && (
                    <button
                      type="button"
                      onClick={handleResetEdits}
                      className="inline-flex items-center gap-1 text-xs font-sans font-medium text-[#B25B3E] hover:text-[#9A4E35] dark:text-[#E07A5F] py-1 px-2 rounded-lg hover:bg-[#F3EFE9] dark:hover:bg-[#0F172A] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditDrawerOpen(false)}
                    aria-label="Close edit drawer"
                    className="p-1.5 rounded-lg text-[#5C5751] hover:text-[#1D2B3A] dark:text-slate-400 dark:hover:text-white hover:bg-[#E5E1D8] dark:hover:bg-[#334155] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                <div>
                  <label className="block text-xs font-sans font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Executive Summary
                  </label>
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    placeholder="Write a concise executive summary..."
                    rows={5}
                    className="w-full resize-y bg-[#F3EFE9]/60 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3 text-xs leading-relaxed text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#5C5751]/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20 outline-none transition-all font-sans"
                  />
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="font-sans text-[11px] text-[#5C5751] dark:text-slate-400">
                      {editedSummary.length} characters
                    </span>
                    {editedSummary !== originalSummary && (
                      <button
                        type="button"
                        onClick={() => setEditedSummary(originalSummary)}
                        className="font-sans text-[11px] text-[#B25B3E] hover:underline"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-sans font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider">
                      Key Highlights & Skills
                    </label>
                    <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#E5E1D8] dark:bg-[#334155] text-[#1D2B3A] dark:text-slate-200">
                      {editedSkills.length}
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddSkill();
                    }}
                    className="flex items-center gap-2 mb-3"
                  >
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Add skill or highlight..."
                      className="flex-1 min-w-0 bg-[#F3EFE9]/60 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl px-3 py-2 text-xs text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#5C5751]/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20 outline-none transition-all font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!newSkillInput.trim()}
                      aria-label="Add Skill"
                      className="bg-[#1D2B3A] hover:bg-[#2A3F55] text-white dark:bg-[#B25B3E] dark:hover:bg-[#9A4E35] disabled:opacity-40 disabled:pointer-events-none p-2 rounded-xl transition-all duration-150 ease-out hover:scale-105 active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {editedSkills.map((skill, index) => (
                      <span
                        key={`mobile-${skill}-${index}`}
                        className="bg-[#F3EFE9] dark:bg-[#0F172A]/80 border border-[#E5E1D8] dark:border-[#334155] text-[#1D2B3A] dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-sans inline-flex items-center gap-1.5"
                      >
                        <span className="truncate max-w-[150px]">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          aria-label={`Remove ${skill}`}
                          className="text-[#5C5751] hover:text-[#B25B3E] dark:text-slate-400 dark:hover:text-[#E07A5F] transition-colors p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {editedSkills.length === 0 && (
                      <p className="text-xs text-[#5C5751] dark:text-slate-400 italic py-1">
                        No skills added yet. Add some above.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5E1D8] dark:border-[#334155] bg-[#F3EFE9]/40 dark:bg-[#0F172A]/40 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="w-full bg-[#1D2B3A] hover:bg-[#2A3F55] text-white dark:bg-white dark:text-[#0F172A] py-3 rounded-xl font-sans font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  Apply & View Resume
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
