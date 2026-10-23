'use client';

import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Globe,
  Filter,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
} from 'lucide-react';
import { SearchSource, AgentInfo } from '../../lib/types';

interface SearcherViewProps {
  sources: SearchSource[];
  agent: AgentInfo;
  onToggleSource?: (id: string) => void;
  onAddCustomSource?: (source: Partial<SearchSource>) => void;
}

export const SearcherView: React.FC<SearcherViewProps> = ({
  sources,
  agent,
  onToggleSource,
  onAddCustomSource,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);

  const uniqueDomains = Array.from(new Set(sources.map((s) => s.domain)));

  const filteredSources = sources.filter((s) => {
    const matchesDomain = selectedDomain === 'all' || s.domain === selectedDomain;
    const matchesText =
      filterQuery === '' ||
      s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.snippet.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.domain.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesDomain && matchesText;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !onAddCustomSource) return;

    let domain = 'custom-source.org';
    try {
      if (customUrl.trim()) {
        domain = new URL(customUrl).hostname.replace(/^www\./, '');
      }
    } catch {
      // default domain
    }

    onAddCustomSource({
      id: `src-user-${Date.now()}`,
      title: customTitle.trim(),
      url: customUrl.trim() || '#',
      domain,
      snippet: `User injected custom research source for targeted analysis: "${customTitle.trim()}".`,
      publishDate: new Date().toISOString().split('T')[0],
      query: 'User Verified Addition',
      relevanceScore: 98,
      authorOrOrg: domain,
      enabled: true,
    });

    setCustomTitle('');
    setCustomUrl('');
    setIsAddingSource(false);
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Header Banner */}
      <div className="liquid-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-tinted-blue flex items-center justify-center text-cyan-300 shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-current">
                Stage 02: Literature Scout
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase liquid-glass-subtle font-bold">
                {agent.status}
              </span>
            </div>
            <p className="text-xs opacity-70">
              Dispatches multi-angle web and academic probes to retrieve primary source literature, datasets, and reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingSource(!isAddingSource)}
            className="flex items-center gap-1.5 h-[38px] px-4 rounded-full liquid-glass-subtle hover:opacity-100 text-xs font-semibold text-current transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#06B6D4]" />
            <span>Add Custom Source</span>
          </button>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-mono opacity-50 block uppercase">
              Indexed Sources
            </span>
            <span className="text-sm font-mono font-bold text-current">
              {sources.length} Documents
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Source Form */}
      {isAddingSource && (
        <form
          onSubmit={handleAddSubmit}
          className="liquid-glass p-5 space-y-3"
        >
          <h4 className="text-xs font-bold text-[#0891B2] uppercase tracking-wider">
            Inject Verified Reference URL / Publication
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Article / Whitepaper Title (e.g. 'Nature Solid-State Energy Density Report 2025')"
              className="bg-white px-3.5 py-2.5 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
            />
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="URL (e.g. 'https://nature.com/articles/s41586-2025')"
              className="bg-white px-3.5 py-2.5 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingSource(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#6B7280] hover:text-[#14181F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!customTitle.trim()}
              className="px-5 py-2 bg-[#151A17] hover:bg-[#262E29] text-white rounded-full text-xs font-bold transition-all disabled:opacity-40"
            >
              Save Source
            </button>
          </div>
        </form>
      )}

      {sources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center text-[#6B7280] space-y-3 shadow-xs">
          <Search className="w-12 h-12 mx-auto text-[#06B6D4] animate-pulse" />
          <h3 className="text-base font-bold text-[#14181F]">
            Literature Scout in Standby
          </h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            Once the research pipeline starts, the Scout will query academic repositories and live web feeds to discover reference documents.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter & Domain Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter sources by title or keyword..."
                className="w-full bg-white px-3.5 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
              />
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedDomain('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all shrink-0 ${
                  selectedDomain === 'all'
                    ? 'bg-[#151A17] text-white shadow-xs'
                    : 'bg-white text-[#6B7280] hover:text-[#14181F] border border-[#D1D5DB]'
                }`}
              >
                All ({sources.length})
              </button>
              {uniqueDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all shrink-0 ${
                    selectedDomain === domain
                      ? 'bg-[#151A17] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#6B7280] hover:text-[#14181F] border border-[#D1D5DB]'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((src, i) => {
              const isEnabled = src.enabled !== false;

              return (
                <div
                  key={src.id || i}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white shadow-[0_2px_8px_rgba(16,24,40,0.04)] hover:shadow-md ${
                    isEnabled
                      ? 'border-[#E5E7EB] hover:border-[#06B6D4]'
                      : 'border-[#E5E7EB] opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
                          {src.domain}
                        </span>
                        {src.isCustomUpload && (
                          <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                            BYOD File
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onToggleSource && (
                          <button
                            onClick={() => onToggleSource(src.id)}
                            className="text-xs text-[#6B7280] hover:text-[#14181F] p-0.5"
                            title={isEnabled ? 'Disable source from report' : 'Enable source'}
                          >
                            {isEnabled ? (
                              <ToggleRight className="w-5 h-5 text-[#16A34A]" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-[#9CA3AF]" />
                            )}
                          </button>
                        )}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6B7280] hover:text-[#2563EB] p-1 transition-colors"
                          title="Open original source URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#14181F] hover:text-[#2563EB] transition-colors leading-snug">
                      {src.title}
                    </h3>

                    <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">
                      {src.snippet}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F1F2F4] flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                    <span className="truncate max-w-[200px]">Query: {src.query}</span>
                    {src.publishDate && <span>Date: {src.publishDate}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
