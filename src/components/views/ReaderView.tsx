'use client';

import React, { useState } from 'react';
import { BookOpen, Quote, Sparkles, Filter, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { ExtractedFact, AgentInfo, ResearchWorkflowState } from '../../lib/types';
import { AgentStatePanel } from '../AgentStatePanel';

interface ReaderViewProps {
  facts: ExtractedFact[];
  agent: AgentInfo;
  workflowStatus?: ResearchWorkflowState['status'];
  workflowError?: string;
  onDeleteFact?: (id: string) => void;
  onAddFact?: (fact: Partial<ExtractedFact>) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  facts,
  agent,
  workflowStatus,
  workflowError,
  onDeleteFact,
  onAddFact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<ExtractedFact['category']>('finding');

  const categories = Array.from(new Set(facts.map((f) => f.category)));

  const filteredFacts = facts.filter((f) => {
    return selectedCategory === 'all' || f.category === selectedCategory;
  });

  const categoryBadgeColors: Record<string, string> = {
    statistic: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    finding: 'bg-blue-50 text-blue-800 border-blue-200',
    expert_opinion: 'bg-purple-50 text-purple-800 border-purple-200',
    counter_argument: 'bg-rose-50 text-rose-800 border-rose-200',
    projection: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim() || !onAddFact) return;

    onAddFact({
      id: `fact-user-${Date.now()}`,
      sourceId: 'src-manual-entry',
      sourceTitle: 'User Injected Primary Fact',
      sourceUrl: '#',
      fact: newFactText.trim(),
      category: newFactCategory,
      confidence: 0.99,
      timeframe: '2024-2025',
    });

    setNewFactText('');
    setIsAddingFact(false);
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Header Banner */}
      <div className="liquid-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#F59E0B] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-current">
                Stage 03: Deep Reader
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-50 text-amber-800 font-bold border border-amber-200">
                {agent.status}
              </span>
            </div>
            <p className="text-xs opacity-70">
              Mines retrieved documents for granular quantitative metrics, empirical results, expert citations, and context quotes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingFact(!isAddingFact)}
            className="flex items-center gap-1.5 h-[38px] px-4 rounded-full liquid-glass-subtle hover:opacity-100 text-xs font-semibold text-current transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Add Verified Fact</span>
          </button>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-mono opacity-50 block uppercase">
              Fact Bank Size
            </span>
            <span className="text-sm font-mono font-bold text-current">
              {facts.length} Verified Claims
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Fact Form */}
      {isAddingFact && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-5 rounded-2xl border border-[#F59E0B]/40 shadow-md space-y-3"
        >
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Add Verified Data Point or Metric
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              value={newFactText}
              aria-label="Verified fact"
              required
              onChange={(e) => setNewFactText(e.target.value)}
              placeholder="e.g. 'Production pilot achieves 450 Wh/kg specific energy density in initial test runs.'"
              className="sm:col-span-3 bg-white px-3.5 py-2.5 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
            />
            <select
              value={newFactCategory}
              aria-label="Fact category"
              onChange={(e) => setNewFactCategory(e.target.value as any)}
              className="bg-white px-3.5 py-2.5 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] focus:border-[#14181F] focus:outline-none"
            >
              <option value="statistic">Statistic</option>
              <option value="finding">Finding</option>
              <option value="expert_opinion">Expert Opinion</option>
              <option value="counter_argument">Counter-Argument</option>
              <option value="projection">Projection</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingFact(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#6B7280] hover:text-[#14181F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newFactText.trim()}
              className="px-5 py-2 bg-[#151A17] hover:bg-[#262E29] text-white rounded-full text-xs font-bold transition-all disabled:opacity-40"
            >
              Save Fact
            </button>
          </div>
        </form>
      )}

      {facts.length === 0 ? (
        <AgentStatePanel
          stageName="Deep Reader"
          outputName="verified facts"
          status={agent.status}
          workflowStatus={workflowStatus}
          icon={<BookOpen className="w-10 h-10 text-[#F59E0B]" aria-hidden="true" />}
          currentTask={agent.currentTask}
          errorMessage={workflowError}
          idleMessage="Verified facts will appear here after the Reader processes the sources found by the Literature Scout."
        />
      ) : (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#151A17] text-white shadow-xs'
                  : 'bg-white text-[#6B7280] hover:text-[#14181F] border border-[#D1D5DB]'
              }`}
            >
              All Categories ({facts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#151A17] text-white shadow-xs'
                    : 'bg-white text-[#6B7280] hover:text-[#14181F] border border-[#D1D5DB]'
                }`}
              >
                {cat} ({facts.filter((f) => f.category === cat).length})
              </button>
            ))}
          </div>

          {/* Fact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFacts.map((fact, i) => (
              <div
                key={fact.id || i}
                className="bg-white p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#F59E0B] transition-all flex flex-col justify-between space-y-3 shadow-[0_2px_8px_rgba(16,24,40,0.04)] hover:shadow-md group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${
                        categoryBadgeColors[fact.category] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {fact.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#D97706] font-bold">
                        Confidence: {Math.round(fact.confidence * 100)}%
                      </span>
                      {onDeleteFact && (
                        <button
                          onClick={() => onDeleteFact(fact.id)}
                          className="text-[#9CA3AF] hover:text-[#DC2626] p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Fact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[#14181F] leading-relaxed">
                    {fact.fact}
                  </p>

                  {fact.quote && (
                    <div className="flex items-start gap-2 text-xs text-[#4B5563] italic bg-[#FFFBEB] p-3 rounded-xl border-l-3 border-[#F59E0B]">
                      <Quote className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                      <span>&ldquo;{fact.quote}&rdquo;</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1F2F4] flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                  <span className="truncate max-w-[240px]">Source: {fact.sourceTitle}</span>
                  <span>{fact.timeframe || '2024-2025'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
