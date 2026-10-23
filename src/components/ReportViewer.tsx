'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Download,
  Copy,
  Printer,
  FileJson,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  List,
  PenTool,
  Clock,
  ChevronDown,
  ChevronUp,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FinalReport, ResearchWorkflowState } from '../lib/types';
import { usePreferences, AppFont } from '../context/PreferencesContext';

interface ReportViewerProps {
  state: ResearchWorkflowState;
  report?: FinalReport;
  streamingChunk?: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  state,
  report,
  streamingChunk,
}) => {
  const { font, setFont, theme } = usePreferences();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);

  const markdownToRender = report?.markdownContent || streamingChunk || '';
  const isWriterActive = state.activeAgent === 'writer';

  // Extract table of contents from markdown headings
  const tableOfContents = useMemo(() => {
    if (!markdownToRender) return [];
    const lines = markdownToRender.split('\n');
    const toc: { level: number; title: string; id: string }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawTitle = match[2].trim().replace(/\*\*/g, '').replace(/\[\^\d+\]/g, '');
        const id = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        toc.push({ level, title: rawTitle, id });
      }
    });

    return toc;
  }, [markdownToRender]);

  const handleCopy = () => {
    if (!markdownToRender) return;
    navigator.clipboard.writeText(markdownToRender);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!markdownToRender) return;
    const blob = new Blob([markdownToRender], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(report?.topic || 'Research_Whitepaper').replace(/[^a-z0-9]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const bundle = {
      metadata: {
        system: 'Multi-Agent Research and Report Factory',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        topic: state.topic,
        depth: state.depth,
        persona: state.persona,
      },
      plan: state.plan,
      sources: state.sources,
      facts: state.facts,
      criticReview: state.criticReview,
      report,
      replanHistory: state.replanHistory || [],
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(state.topic || 'Research_Bundle').replace(/[^a-z0-9]/gi, '_')}_bundle.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToCitation = (citIndex: number) => {
    setHighlightedCitation(citIndex);
    const element = document.getElementById(`citation-ref-${citIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.remove('citation-target-highlight');
      void element.offsetWidth; // trigger reflow
      element.classList.add('citation-target-highlight');
    }
  };

  // Custom markdown component transformations
  const customComponents = {
    a: ({ href, children, ...props }: any) => {
      const text = String(children);
      const footnoteMatch = text.match(/\[\^?(\d+)\]/);
      if (footnoteMatch) {
        const citIdx = parseInt(footnoteMatch[1], 10);
        return (
          <button
            type="button"
            onClick={() => scrollToCitation(citIdx)}
            className="citation-sup inline-flex items-center"
            title={`Jump to Reference [${citIdx}]`}
          >
            [{citIdx}]
          </button>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-medium inline-flex items-center gap-0.5"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return <h3 id={id} {...props}>{children}</h3>;
    },
  };

  const estimatedReadingTime =
    report?.readingTimeMinutes ||
    Math.max(1, Math.ceil(markdownToRender.split(/\s+/).length / 200));

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_12px_rgba(16,24,40,0.06)] overflow-hidden">
      {/* Report Toolbar Header (White, border-b #E5E7EB) */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-3.5 gap-3 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center text-[#A855F7] shrink-0">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#14181F]">
                Synthesized Research Whitepaper
              </h3>
              {isWriterActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono font-bold animate-pulse">
                  Streaming Draft...
                </span>
              )}
            </div>
            {markdownToRender && (
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span>{markdownToRender.trim().split(/\s+/).length} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  {estimatedReadingTime} min read
                </span>
                {report && report.citations.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#2563EB] font-semibold">
                      {report.citations.length} cited sources
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Export Buttons (Pill Shapes) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time Typography Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#334155] rounded-full px-2.5 h-[38px]">
            <Type className="w-3.5 h-3.5 text-[#7C3AED]" />
            <select
              value={font}
              onChange={(e) => setFont(e.target.value as AppFont)}
              className="bg-transparent text-xs font-semibold text-[#14181F] dark:text-white focus:outline-none cursor-pointer"
              title="Change Whitepaper Font"
            >
              <option value="inter">Inter Sans</option>
              <option value="serif">Editorial Serif</option>
              <option value="mono">Technical Mono</option>
              <option value="lexend">Lexend Soft</option>
              <option value="playfair">Playfair Academic</option>
            </select>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#334155] rounded-full px-1.5 h-[38px]">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 hover:text-[#2563EB] text-[#6B7280]"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
              className="p-1 hover:text-[#2563EB] text-[#6B7280]"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {tableOfContents.length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-xs font-semibold text-[#14181F] dark:text-white border border-[#D1D5DB] dark:border-[#334155] transition-all shadow-xs"
              title="Toggle Table of Contents"
            >
              <List className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Contents</span>
              {showToc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-xs font-semibold text-[#14181F] dark:text-white border border-[#D1D5DB] dark:border-[#334155] transition-all shadow-xs"
            title="Copy Markdown Content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-xs font-semibold text-[#14181F] dark:text-white border border-[#D1D5DB] dark:border-[#334155] transition-all shadow-xs"
            title="Export as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-full bg-[#151A17] dark:bg-[#2563EB] hover:bg-[#262E29] text-white text-xs font-semibold transition-all shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Table of Contents Drawer/Panel */}
      {showToc && tableOfContents.length > 0 && (
        <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] p-4 text-xs space-y-1.5 no-print animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="font-bold text-[#14181F] uppercase tracking-wider text-[11px] block mb-2">
            Table of Contents
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 max-h-[160px] overflow-y-auto">
            {tableOfContents.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                onClick={() => setShowToc(false)}
                className={`truncate block py-0.5 text-[#4B5563] hover:text-[#2563EB] hover:underline transition-colors ${
                  item.level === 1 ? 'font-bold text-[#14181F]' : item.level === 2 ? 'pl-3' : 'pl-6 text-[11px]'
                }`}
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Document Body: Centered 760px column, 17px/1.7 text */}
      <div
        className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-14 bg-white dark:bg-[#0B0F19] text-[#14181F] dark:text-[#E2E8F0] transition-colors duration-150"
        style={{ fontSize: `${(17 * zoomLevel) / 100}px` }}
      >
        {!markdownToRender ? (
          <div className="text-center py-20 max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center mx-auto text-[#A855F7]">
              <PenTool className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-[#14181F]">
              Whitepaper Awaiting Synthesis
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Launch research to activate the 5-agent pipeline. The Executive Synthesizer will stream the comprehensive, citation-backed whitepaper here.
            </p>
          </div>
        ) : (
          <div className="max-w-[760px] mx-auto space-y-8">
            {/* Whitepaper Title Banner */}
            {report?.title && (
              <div className="border-b border-[#E5E7EB] pb-6 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#581C87] bg-[#EAD5FF]/60 px-2.5 py-1 rounded-full font-bold border border-[#D8B4FE]">
                  Multi-Agent Intelligence Whitepaper
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14181F] tracking-tight leading-tight pt-2">
                  {report.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-[#6B7280] pt-1">
                  <span>Author: <strong>Executive Synthesizer</strong></span>
                  <span>•</span>
                  <span>Audited by: <strong>Epistemic Critic</strong></span>
                  <span>•</span>
                  <span>Target: <strong className="capitalize">{state.persona}</strong></span>
                </div>
              </div>
            )}

            {/* Markdown Body */}
            <article className="prose-report">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={customComponents}
              >
                {markdownToRender}
              </ReactMarkdown>
            </article>

            {/* Verified Footnote Citations / Bibliography */}
            {report && report.citations.length > 0 && (
              <div className="pt-8 mt-12 border-t-2 border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#14181F] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                    Verified Citation References ({report.citations.length})
                  </h3>
                  <span className="text-xs text-[#6B7280]">
                    Audited for Epistemic Integrity
                  </span>
                </div>

                <div className="space-y-3">
                  {report.citations.map((cit, idx) => (
                    <div
                      key={cit.id || idx}
                      id={`citation-ref-${idx + 1}`}
                      className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs space-y-1 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#151A17] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[#14181F]">
                            {cit.title}
                          </span>
                        </div>
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>{cit.domain}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[#6B7280] text-[11px] pl-7">
                        Cited in whitepaper claims. Credibility score audited by Epistemic Critic.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
