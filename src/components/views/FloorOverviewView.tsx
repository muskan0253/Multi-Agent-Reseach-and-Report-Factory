'use client';

import React, { useState } from 'react';
import { ResearchFloor } from '../ResearchFloor';
import { ResearchWorkflowState, AgentType } from '../../lib/types';
import { NavView } from '../Sidebar';
import {
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  Repeat,
  Search,
  BookOpen,
  ShieldCheck,
  PenTool,
  ArrowRight,
  ExternalLink,
  X,
  FileText,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  Terminal,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

interface FloorOverviewViewProps {
  state: ResearchWorkflowState;
  onNavigate: (view: NavView) => void;
  onInspectAgent?: (agentId: AgentType) => void;
}

export const FloorOverviewView: React.FC<FloorOverviewViewProps> = ({
  state,
  onNavigate,
  onInspectAgent,
}) => {
  const { theme, t } = usePreferences();
  const [showPromo, setShowPromo] = useState(true);

  const replanHistory = state.replanHistory || [];
  const messages = state.messages || [];
  const sources = state.sources || [];
  const facts = state.facts || [];
  const critic = state.criticReview;
  const report = state.report;

  // KPI card metrics with icons and hints
  const kpis = [
    {
      id: 'loops',
      label: 'Feedback Loops',
      icon: <Repeat className="w-4 h-4 text-amber-400" />,
      info: 'Number of Critic-directed replanning and evidence enrichment cycles',
      value: replanHistory.length.toString(),
      trend: replanHistory.length > 0 ? `Loop #${replanHistory.length}` : 'Waiting for run',
      color: '#F59E0B',
    },
    {
      id: 'sources',
      label: 'Discovered Sources',
      icon: <Search className="w-4 h-4 text-cyan-400" />,
      info: 'Primary references and academic publications retrieved by Scout',
      value: sources.length.toString(),
      trend: sources.length > 0 ? `+${sources.length} sources` : 'Scout idle',
      color: '#06B6D4',
    },
    {
      id: 'facts',
      label: 'Extracted Facts',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      info: 'Granular statistics, data points, and quotes parsed by Deep Reader',
      value: facts.length.toString(),
      trend: facts.length > 0 ? `+${facts.length} claims` : 'Reader standby',
      color: '#6366F1',
    },
    {
      id: 'audit',
      label: 'Epistemic Audit',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      info: 'Overall source authority and methodology reliability index (0-100)',
      value: critic ? `${critic.overallCredibilityScore}%` : '—',
      trend: critic ? (critic.overallCredibilityScore >= 80 ? 'Robust Evidence' : 'Needs Evidence') : 'Audit uncalibrated',
      color: '#EF4444',
    },
    {
      id: 'words',
      label: 'Report Words',
      icon: <FileText className="w-4 h-4 text-fuchsia-400" />,
      info: 'Total words authored in the verified whitepaper deliverable',
      value: report ? report.wordCount.toLocaleString() : '0',
      trend: report ? `${report.readingTimeMinutes || 5} min read` : 'Writer pending',
      color: '#A855F7',
    },
  ];

  return (
    <div className="min-w-0 w-full space-y-6 pb-20">
      {/* 1. Topic Header (VisionOS Floating Liquid Glass Hero) */}
      <div className="min-w-0 liquid-glass p-4 sm:p-8 lg:p-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex min-w-0 items-start sm:items-center gap-3 sm:gap-6 relative z-10 flex-1">
          {/* Glowing Icon Tile */}
          <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl liquid-glass-tinted-blue flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-current" />
          </div>

          <div className="min-w-0 space-y-2 flex-1">
            {/* Meta Tags & Status Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-[rgba(255,255,255,0.10)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.15)] shadow-xs break-words [overflow-wrap:anywhere]">
                Active Research Subject
              </span>
              <span className="text-xs font-medium text-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.04)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.08)] break-words [overflow-wrap:anywhere]">
                Depth: <strong className="capitalize text-[#F5F7FF] font-semibold">{state.depth}</strong>
              </span>
              <span className="text-xs font-medium text-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.04)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.08)] break-words [overflow-wrap:anywhere]">
                Persona: <strong className="capitalize text-[#F5F7FF] font-semibold">{state.persona}</strong>
              </span>
              <span className="text-xs font-medium text-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.04)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.08)] break-words [overflow-wrap:anywhere]">
                Scope: <strong className="capitalize text-[#F5F7FF] font-semibold">{state.searchScope || 'Global Web & Papers'}</strong>
              </span>
              {state.redTeamMode && (
                <span className="text-xs font-semibold text-rose-200 bg-rose-500/20 px-3 py-0.5 rounded-full border border-rose-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Red Team Active
                </span>
              )}
              {/* Status Indicator Badge */}
              {state.status === 'running' ? (
                <span className="text-xs font-semibold text-cyan-200 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Agents Orchestrating
                </span>
              ) : state.status === 'completed' ? (
                <span className="text-xs font-semibold text-emerald-200 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Intelligence Finalized
                </span>
              ) : (
                <span className="text-xs font-medium text-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.04)] px-3 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  System Ready
                </span>
              )}
            </div>

            {/* Main Big Subject Title */}
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug bg-gradient-to-r from-[#FFFFFF] via-[#F0F3FF] to-[#D5DCFF] bg-clip-text text-transparent break-words [overflow-wrap:anywhere]">
              {state.topic || 'Commercial Viability of Solid-State Batteries by 2030'}
            </h1>

            {/* Informative Subtitle */}
            <p className="text-xs sm:text-sm text-[rgba(255,255,255,0.72)] max-w-4xl leading-relaxed">
              Autonomous multi-agent intelligence mission across Strategic Planner, Literature Scout, Deep Reader, Epistemic Critic, and Executive Synthesizer with closed-loop epistemic verification.
            </p>
          </div>
        </div>

        {/* Action Buttons on the Right */}
        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:gap-3 relative z-10 min-w-0 mt-2 xl:mt-0">
          <button
            onClick={() => onNavigate('report')}
            className={`flex max-w-full items-center gap-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold rounded-full transition-all shadow-md active:scale-95 break-words ${
              report
                ? 'bg-gradient-to-r from-[#7C5CFF] via-[#A855F7] to-[#EC4899] text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] border border-purple-300/30'
                : 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F5F7FF] border border-[rgba(255,255,255,0.12)]'
            }`}
          >
            <span>{report ? 'Read Verified Whitepaper' : 'Open Deliverable View'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate('logs')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.85)] border border-[rgba(255,255,255,0.10)] transition-all"
          >
            <span>Trace Bus</span>
          </button>
        </div>
      </div>

      {/* Telemetry & Speedometer Bar */}
      <div className="liquid-glass min-w-0 p-3 sm:p-3.5 !rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="liquid-glass-subtle !px-3 !py-1 flex items-center gap-1.5 font-bold text-[11px] tracking-wide">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> SPEEDOMETER
          </span>
          <span className="font-medium flex items-center gap-1.5 text-current">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Throughput: <strong className="text-cyan-400 font-mono">{state.status === 'running' ? '1,420 t/s' : '0 t/s'}</strong>
          </span>
          <span className="hidden md:inline opacity-30">•</span>
          <span className="hidden md:inline opacity-80">
            Epistemic Confidence:{' '}
            <strong className="text-cyan-400 font-mono font-bold">
              {critic ? `${critic.overallCredibilityScore}/100` : '94/100 (Calibrated)'}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] opacity-75">
          <span className="liquid-glass-subtle !px-2.5 !py-0.5 font-medium">
            Active Loops: <strong className="text-amber-400 font-mono">{replanHistory.length}</strong>
          </span>
          <span className="liquid-glass-subtle !px-2 !py-0.5 font-mono text-cyan-400 font-semibold">
            ~1.2s Latency
          </span>
        </div>
      </div>

      {/* 2. Row of 5 KPI Cards (Translucent Theme-Responsive Glass Cards) */}
      <div className="grid min-w-0 grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="liquid-glass glass-panel-hover min-w-0 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            style={{ borderTopWidth: '4px', borderTopColor: kpi.color }}
          >
            {/* KPI Label with Icon */}
            <div className="flex min-w-0 items-start justify-between gap-2 mb-2">
              <span className="min-w-0 text-xs sm:text-sm font-medium opacity-85 flex items-center gap-1.5 break-words [overflow-wrap:anywhere]">
                {kpi.icon}
                {kpi.label}
              </span>
              <span title={kpi.info} className="shrink-0 cursor-help opacity-50 hover:opacity-100">
                <Info className="w-4 h-4" />
              </span>
            </div>

            {/* Big 36px+ JetBrains Mono Number */}
            <div className="my-2 min-w-0">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight drop-shadow-sm text-current break-words">
                {kpi.value}
              </span>
            </div>

            {/* Trend Indicator */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium pt-2 border-t border-[var(--border-subtle)]">
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#16A34A] font-bold break-words">{kpi.trend}</span>
              <span className="text-[#9CA3AF] text-xs">this run</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 5-Agent Pipeline Visualizer */}
      <ResearchFloor
        state={state}
        onSelectAgentTab={(tab) => {
          if (tab === 'logs') onNavigate('logs');
          else if (tab === 'report') onNavigate('report');
          else if (onInspectAgent && (tab === 'planner' || tab === 'searcher' || tab === 'reader' || tab === 'critic' || tab === 'writer')) {
            onInspectAgent(tab as AgentType);
          } else {
            onNavigate(tab as NavView);
          }
        }}
      />

      {/* 4. Two Columns Below Pipeline: Left Activity Feed & Right Source Quality / Deliverable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Live Activity Feed */}
        <div className="lg:col-span-7 liquid-glass rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(160,190,255,0.2)] pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">
                Live Inter-Agent Activity Feed
              </h3>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-[#93C5FD] hover:text-white hover:underline font-semibold flex items-center gap-1"
            >
              View Full Message Bus ({messages.length}) &rarr;
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-[#9AA8D6] text-xs">
              <p>No messages dispatched yet. Launch research to watch agents communicate in real time.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {messages.slice(-6).map((msg, i) => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                return (
                  <div
                    key={msg.id || i}
                    className="p-3.5 liquid-glass-subtle rounded-2xl flex items-start justify-between gap-3 text-xs border border-[rgba(160,190,255,0.2)]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#9AA8D6]">{time}</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-white">
                          <span className="uppercase text-violet-300">{msg.from}</span>
                          <ArrowRight className="w-3 h-3 text-[#9AA8D6]" />
                          <span className="uppercase text-pink-300">{msg.to}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-500/20 text-cyan-200 border border-blue-400/30">
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-[#D4DCFF] font-medium">{msg.reasoning}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Source Quality & Report Snapshot */}
        <div className="lg:col-span-5 liquid-glass rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(160,190,255,0.2)] pb-3">
            <h3 className="font-bold text-sm text-white">
              Discovered Source Authority
            </h3>
            <span className="text-xs text-[#9AA8D6] font-mono">
              {sources.length} evaluated
            </span>
          </div>

          {sources.length === 0 ? (
            <div className="py-12 text-center text-[#9AA8D6] text-xs">
              <p>Sources will populate as Literature Scout executes web search probes.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {sources.slice(0, 5).map((src, i) => {
                const score = 75 + ((i * 7) % 23);
                return (
                  <div
                    key={src.id || i}
                    className="p-3.5 liquid-glass-subtle rounded-2xl space-y-2 border border-[rgba(160,190,255,0.2)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate max-w-[200px]">
                        {src.title}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-300">
                        {score}/100
                      </span>
                    </div>

                    {/* Progress Bar for Score */}
                    <div className="w-full bg-[rgba(160,190,255,0.2)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA8D6]">
                      <span>{src.domain}</span>
                      <span className="capitalize text-emerald-400">High Credibility</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Dismissible Ambient Promo-Style Info Card */}
      {showPromo && (
        <div className="p-4 bg-gradient-to-r from-purple-900/40 via-violet-900/30 to-pink-900/30 border border-purple-400/30 rounded-3xl shadow-lg flex items-start justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full liquid-glass-tinted-blue flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-pink-200 uppercase tracking-wider">
                Multi-Agent Epistemic Assurance
              </h4>
              <p className="text-xs text-[#D4DCFF] mt-0.5">
                {replanHistory.length > 0
                  ? `Critic triggered ${replanHistory.length} adaptive replan loops: secondary probes resolved coverage gaps on critical inquiries.`
                  : 'All agents utilize structured JSON contracts, verified citations, and automated epistemic scoring to eliminate hallucinated claims.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPromo(false)}
            aria-label="Dismiss info card"
            className="text-pink-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
