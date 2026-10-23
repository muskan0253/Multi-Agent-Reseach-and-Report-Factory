'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, X, Search, Trash2, ArrowRight, Clock, FileText } from 'lucide-react';
import { SavedResearchItem, FinalReport } from '../lib/types';

interface ResearchLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadReport: (item: SavedResearchItem) => void;
  currentReport?: FinalReport;
}

export const ResearchLibraryModal: React.FC<ResearchLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadReport,
  currentReport,
}) => {
  const [savedItems, setSavedItems] = useState<SavedResearchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('research_factory_library');
        if (raw) {
          setSavedItems(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  const handleSaveCurrent = () => {
    if (!currentReport) return;
    const newItem: SavedResearchItem = {
      id: `lib-${Date.now()}`,
      topic: currentReport.topic,
      depth: currentReport.plan.depth,
      persona: currentReport.plan.persona || 'executive',
      savedAt: new Date().toISOString(),
      report: currentReport,
      sourcesCount: currentReport.citations.length,
      factsCount: currentReport.criticReview.verifiedFactsCount,
      credibilityScore: currentReport.criticReview.overallCredibilityScore,
    };

    const updated = [newItem, ...savedItems.filter((i) => i.topic !== currentReport.topic)];
    setSavedItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('research_factory_library', JSON.stringify(updated));
    }
  };

  const handleDelete = (id: string) => {
    const updated = savedItems.filter((i) => i.id !== id);
    setSavedItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('research_factory_library', JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  const filtered = savedItems.filter((i) =>
    i.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#14181F]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14181F]">
                Research Archive &amp; Library
              </h3>
              <p className="text-xs text-[#6B7280]">Saved research intelligence and whitepapers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#14181F] hover:bg-[#F1F2F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved whitepapers..."
              className="w-full bg-white pl-10 pr-4 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
            />
          </div>

          {currentReport && (
            <button
              onClick={handleSaveCurrent}
              className="h-[38px] px-4 bg-[#151A17] hover:bg-[#262E29] text-white rounded-full text-xs font-bold transition-all shadow-xs shrink-0"
            >
              + Bookmark Current Report
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280] text-xs">
              No saved research reports yet. Launch a topic and bookmark the report here.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white hover:bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] hover:border-[#14181F] transition-all flex items-center justify-between gap-3 shadow-xs group"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 uppercase font-semibold">
                      {item.persona}
                    </span>
                    <h4 className="text-xs font-bold text-[#14181F] group-hover:text-[#2563EB] truncate">
                      {item.topic}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    {item.report.wordCount} words • Score: {item.credibilityScore}% • {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onLoadReport(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-full bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#14181F] border border-[#D1D5DB] transition-all shadow-xs"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete saved report: ${item.topic}`}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
