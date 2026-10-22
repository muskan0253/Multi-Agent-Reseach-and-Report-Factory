'use client';

import React from 'react';
import {
  Compass,
  Search,
  BookOpen,
  ShieldCheck,
  PenTool,
  ArrowRight,
  Repeat,
  CornerUpLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ResearchWorkflowState, AgentType } from '../lib/types';

interface ResearchFloorProps {
  state: ResearchWorkflowState;
  selectedAgentTab?: AgentType | 'logs' | 'report';
  onSelectAgentTab: (tab: AgentType | 'logs' | 'report') => void;
}

const AGENT_ORDER: AgentType[] = ['planner', 'searcher', 'reader', 'critic', 'writer'];

const AGENT_META: Record<
  AgentType,
  {
    name: string;
    stageNum: string;
    role: string;
    icon: React.ReactNode;
    color: string;
    bgTint: string;
    tooltip: string;
  }
> = {
  planner: {
    name: 'Strategic Planner',
    stageNum: '01',
    role: 'Deconstructs taxonomy, hypotheses & search vectors',
    icon: <Compass className="w-4 h-4 text-[#7C5CFF]" />,
    color: '#7C5CFF',
    bgTint: 'rgba(124, 92, 255, 0.15)',
    tooltip: 'Deconstructs research query into taxonomy, sub-questions, and targeted search vectors.',
  },
  searcher: {
    name: 'Literature Scout',
    stageNum: '02',
    role: 'Multi-perspective web & repository retrieval',
    icon: <Search className="w-4 h-4 text-[#22D3EE]" />,
    color: '#22D3EE',
    bgTint: 'rgba(34, 211, 238, 0.15)',
    tooltip: 'Dispatches targeted web search probes, discovers primary sources, and ranks authority.',
  },
  reader: {
    name: 'Deep Reader',
    stageNum: '03',
    role: 'Mines quantitative metrics, quotes & facts',
    icon: <BookOpen className="w-4 h-4 text-[#F59E0B]" />,
    color: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.15)',
    tooltip: 'Parses document bodies to extract quantitative metrics, findings, quotes, and data tables.',
  },
  critic: {
    name: 'Epistemic Critic',
    stageNum: '04',
    role: 'Fact audits, bias rating & replanning loops',
    icon: <ShieldCheck className="w-4 h-4 text-[#F43F5E]" />,
    color: '#F43F5E',
    bgTint: 'rgba(244, 63, 94, 0.15)',
    tooltip: 'Evaluates domain authority, calculates credibility, stress-tests claims, and triggers replan loops.',
  },
  writer: {
    name: 'Executive Synthesizer',
    stageNum: '05',
    role: 'Drafts cited whitepaper & presentation deck',
    icon: <PenTool className="w-4 h-4 text-[#D946EF]" />,
    color: '#D946EF',
    bgTint: 'rgba(217, 70, 239, 0.15)',
    tooltip: 'Synthesizes verified evidence into an exhaustive whitepaper with standard footnote citations.',
  },
};

export const ResearchFloor: React.FC<ResearchFloorProps> = ({
  state,
  selectedAgentTab,
  onSelectAgentTab,
}) => {
  const replanHistory = state.replanHistory || [];
  const hasReplanActive = replanHistory.length > 0;
  const isRunning = state.status === 'running';

  return (
    <div className="w-full min-w-0 liquid-glass p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Floor Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
        <div className="min-w-0">
          <h3 className="min-w-0 text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2.5 break-words text-current">
            Autonomous Agent Pipeline
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full liquid-glass-subtle">
              5 Specialized Stations
            </span>
          </h3>
          <p className="text-xs sm:text-sm opacity-70 pt-1 break-words [overflow-wrap:anywhere]">
            Continuous inter-agent coordination over typed message bus with adaptive evaluator-optimizer feedback
          </p>
        </div>

        {hasReplanActive && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-medium">
            <Repeat className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Critic Feedback Active (Loop #{replanHistory.length})</span>
          </div>
        )}
      </div>

      {/* 5 Agent Cards Pipeline Row */}
      <div className="grid min-w-0 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5 relative">
        {AGENT_ORDER.map((agentId, index) => {
          const meta = AGENT_META[agentId];
          const agent = state.agents[agentId];
          const isActive = state.activeAgent === agentId;
          const isCompleted = agent.status === 'completed';
          const isReplanning =
            (agentId === 'critic' || agentId === 'searcher' || agentId === 'reader') &&
            hasReplanActive &&
            isActive;

          // Status Badge
          let statusLabel = 'Idle';
          let statusStyle = 'bg-white/10 opacity-70 border-[var(--border-subtle)]';

          if (isReplanning) {
            statusLabel = 'Replanning';
            statusStyle = 'bg-amber-500/30 text-amber-300 border-amber-400/40 animate-pulse';
          } else if (isActive) {
            statusLabel = 'Running';
            statusStyle = 'bg-cyan-500/30 text-cyan-300 border-cyan-400/40 animate-pulse';
          } else if (isCompleted) {
            statusLabel = 'Done';
            statusStyle = 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40';
          } else if (agent.status === 'error') {
            statusLabel = 'Error';
            statusStyle = 'bg-rose-500/30 text-rose-300 border-rose-400/40';
          }

          return (
            <div key={agentId} className="relative flex flex-col">
              {/* Desktop Connecting Arrow */}
              {index < AGENT_ORDER.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-20 z-10 items-center justify-center pointer-events-none">
                  <ArrowRight
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isCompleted ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-[#64748B]'
                    } ${isRunning && isActive ? 'animate-pulse text-cyan-400' : ''}`}
                  />
                </div>
              )}

              {/* Theme-Responsive Frosted Agent Card */}
              <button
                type="button"
                onClick={() => onSelectAgentTab(agentId)}
                title={meta.tooltip}
                className={`w-full min-w-0 text-left p-4 sm:p-5 liquid-glass glass-panel-hover transition-all duration-200 relative group cursor-pointer flex flex-col justify-between min-h-[195px] h-full ${
                  isActive
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)] translate-y-[-2px]'
                    : ''
                }`}
                style={{
                  borderTopWidth: '3px',
                  borderTopColor: meta.color,
                }}
              >
                {/* Active agent subtle indicator */}
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  </span>
                )}

                {/* Card Top: Icon chip, stage number, name, status pill */}
                <div>
                  <div className="flex min-w-0 items-center justify-between gap-2 mb-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.12)]"
                        style={{ backgroundColor: meta.bgTint }}
                      >
                        {meta.icon}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[rgba(255,255,255,0.50)]">
                        {meta.stageNum}
                      </span>
                    </div>

                    <span
                      className={`max-w-full text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider whitespace-normal text-center ${statusStyle}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h4 className="min-w-0 text-sm font-bold text-[var(--text-primary)] group-hover:text-white transition-colors truncate">
                    {meta.name}
                  </h4>
                  <p className="text-[11px] text-[rgba(255,255,255,0.60)] line-clamp-1 mt-0.5">
                    {agent.role}
                  </p>
                </div>

                {/* Card Bottom: Progress Bar & Current Task/Metric */}
                <div className="space-y-1.5 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                  <div className="w-full bg-[rgba(255,255,255,0.08)] rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${agent.progress}%`,
                        backgroundColor: isCompleted ? '#34D399' : meta.color,
                        boxShadow: isActive ? `0 0 8px ${meta.color}` : 'none',
                      }}
                    />
                  </div>

                  <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
                    <span className="min-w-0 flex-1 truncate text-[var(--text-primary)] font-medium">
                      {agent.currentTask || (isCompleted ? 'Finished' : 'Waiting')}
                    </span>
                    {agent.durationMs ? (
                      <span className="shrink-0 text-cyan-300">
                        {(agent.durationMs / 1000).toFixed(1)}s
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Curved Replan Loop Arrow: Critic back to Scout/Planner */}
      {hasReplanActive && (
        <div className="mt-4 p-3.5 bg-[rgba(245,158,11,0.08)] border border-amber-400/30 rounded-xl flex flex-wrap items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <CornerUpLeft className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0 break-words [overflow-wrap:anywhere]">
              <span className="font-bold mr-1 text-[var(--text-primary)]">
                Adaptive Feedback Loop #{replanHistory.length}:
              </span>
              <span className="text-[var(--text-secondary)]">
                {replanHistory[replanHistory.length - 1].reason} (Redirected from Critic to Scout)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] border border-amber-400/30 text-amber-200 shrink-0">
            Evaluator-Optimizer Active
          </span>
        </div>
      )}
    </div>
  );
};
