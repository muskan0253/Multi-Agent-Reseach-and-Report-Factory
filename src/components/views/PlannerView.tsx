'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Target,
  HelpCircle,
  Layers,
  Search,
  ListOrdered,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { ResearchPlan, AgentInfo, ResearchWorkflowState } from '../../lib/types';
import { AgentStatePanel } from '../AgentStatePanel';

interface PlannerViewProps {
  plan?: ResearchPlan;
  agent: AgentInfo;
  workflowStatus?: ResearchWorkflowState['status'];
  workflowError?: string;
  onUpdatePlan?: (updatedPlan: ResearchPlan) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  plan,
  agent,
  workflowStatus,
  workflowError,
  onUpdatePlan,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');

  const handleAddQuestion = () => {
    if (!plan || !newQuestion.trim() || !onUpdatePlan) return;
    const updated = {
      ...plan,
      subQuestions: [...plan.subQuestions, newQuestion.trim()],
    };
    onUpdatePlan(updated);
    setNewQuestion('');
  };

  const handleDeleteQuestion = (index: number) => {
    if (!plan || !onUpdatePlan) return;
    const updated = {
      ...plan,
      subQuestions: plan.subQuestions.filter((_, i) => i !== index),
    };
    onUpdatePlan(updated);
  };

  const handleAddHypothesis = () => {
    if (!plan || !newHypothesis.trim() || !onUpdatePlan) return;
    const updated = {
      ...plan,
      hypotheses: [...plan.hypotheses, newHypothesis.trim()],
    };
    onUpdatePlan(updated);
    setNewHypothesis('');
  };

  const handleDeleteHypothesis = (index: number) => {
    if (!plan || !onUpdatePlan) return;
    const updated = {
      ...plan,
      hypotheses: plan.hypotheses.filter((_, i) => i !== index),
    };
    onUpdatePlan(updated);
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Header Banner */}
      <div className="liquid-glass p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-tinted-blue flex items-center justify-center text-white shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-current">
                Stage 01: Strategic Planner
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase liquid-glass-subtle font-bold">
                {agent.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono liquid-glass-subtle font-medium">
                Human Steering Enabled
              </span>
            </div>
            <p className="text-xs opacity-70">
              Deconstructs research subject taxonomy, core hypotheses, targeted audience parameters, and boolean queries.
            </p>
          </div>
        </div>

        {agent.durationMs && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono opacity-50 block uppercase">Runtime</span>
            <span className="text-sm font-mono font-bold text-current">
              {(agent.durationMs / 1000).toFixed(1)}s
            </span>
          </div>
        )}
      </div>

      {!plan ? (
        <AgentStatePanel
          stageName="Strategic Planner"
          outputName="research plan"
          status={agent.status}
          workflowStatus={workflowStatus}
          icon={<Compass className="w-10 h-10 text-[#6366F1]" aria-hidden="true" />}
          currentTask={agent.currentTask}
          errorMessage={workflowError}
          idleMessage="Launch a research topic from the top bar to have the Planner decompose requirements and build targeted inquiry vectors."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scope, Hypotheses & Audience (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Target Audience */}
            <div className="liquid-glass p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6366F1]">
                <Target className="w-4 h-4" />
                Target Audience &amp; Analytical Scope
              </div>
              <p className="text-sm font-medium leading-relaxed text-current">
                {plan.targetAudience}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] font-mono liquid-glass-subtle !px-2.5 !py-1 font-semibold">
                  Depth: {plan.depth.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Core Objectives */}
            <div className="liquid-glass p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6366F1]">
                <Sparkles className="w-4 h-4" />
                Core Research Objectives
              </div>
              <ul className="space-y-2">
                {plan.coreObjectives?.map((obj, i) => (
                  <li
                    key={i}
                    className="text-xs text-[#334155] flex items-start gap-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Working Hypotheses with Human-in-the-loop editing */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6366F1]">
                  <Layers className="w-4 h-4" />
                  Working Hypotheses ({plan.hypotheses?.length})
                </div>
                <span className="text-[10px] text-[#6B7280] font-mono">Interactive</span>
              </div>

              <div className="space-y-2">
                {plan.hypotheses?.map((hyp, i) => (
                  <div
                    key={i}
                    className="text-xs text-[#14181F] bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB] flex items-start justify-between gap-2"
                  >
                    <div>
                      <strong className="text-[#6366F1] block mb-0.5">
                        Hypothesis {i + 1}:
                      </strong>
                      <span>{hyp}</span>
                    </div>
                    {onUpdatePlan && (
                      <button
                        onClick={() => handleDeleteHypothesis(i)}
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Delete Hypothesis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Hypothesis */}
              {onUpdatePlan && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newHypothesis}
                    onChange={(e) => setNewHypothesis(e.target.value)}
                    placeholder="Inject new testable hypothesis..."
                    className="flex-1 bg-white px-3 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
                  />
                  <button
                    onClick={handleAddHypothesis}
                    disabled={!newHypothesis.trim()}
                    className="px-4 py-2 bg-[#151A17] hover:bg-[#262E29] text-white rounded-full text-xs font-bold transition-all disabled:opacity-40 shrink-0"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Questions, Search Vectors & Outline (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Sub-Questions with Human-in-the-loop editing */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6366F1]">
                  <HelpCircle className="w-4 h-4" />
                  Key Lines of Inquiry ({plan.subQuestions?.length})
                </div>
                <span className="text-[10px] text-[#6B7280] font-mono">Interactive</span>
              </div>

              <div className="space-y-2">
                {plan.subQuestions?.map((q, i) => (
                  <div
                    key={i}
                    className="text-xs text-[#14181F] bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB] flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[#6366F1] font-bold">Q{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                    {onUpdatePlan && (
                      <button
                        onClick={() => handleDeleteQuestion(i)}
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Question */}
              {onUpdatePlan && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add custom research question to investigate..."
                    className="flex-1 bg-white px-3 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#14181F] placeholder-[#9CA3AF] focus:border-[#14181F] focus:outline-none"
                  />
                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestion.trim()}
                    className="px-4 py-2 bg-[#151A17] hover:bg-[#262E29] text-white rounded-full text-xs font-bold transition-all disabled:opacity-40 shrink-0"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>

            {/* Search Query Vectors */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                <Search className="w-4 h-4" />
                Dispatched Query Vectors for Literature Scout
              </div>
              <div className="grid grid-cols-1 gap-2">
                {plan.searchQueries?.map((sq, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E5E7EB] text-[#334155] flex items-center gap-2"
                  >
                    <span>🔍</span>
                    <span className="truncate">{sq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Section Blueprint */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                <ListOrdered className="w-4 h-4" />
                Proposed Report Section Blueprint
              </div>
              <div className="divide-y divide-[#E5E7EB] bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] overflow-hidden">
                {plan.proposedSections?.map((sec, i) => (
                  <div key={i} className="p-3 text-xs flex items-center justify-between gap-3">
                    <span className="font-semibold text-[#14181F]">{sec.title}</span>
                    <span className="text-[#6B7280] text-[11px] truncate max-w-xs">{sec.focus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
