'use client';

import React from 'react';
import {
  Sparkles,
  Sliders,
  Play,
  StopCircle,
  Flame,
  Search,
  ChevronDown,
  UploadCloud,
  Bookmark,
  Compass,
  BookOpen,
  ShieldCheck,
  PenTool,
  Terminal,
  LayoutDashboard,
  FileText,
  Repeat,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { ResearchWorkflowState, ResearchDepth, ReportPersona, SearchScope } from '../lib/types';
import { NavView } from './Sidebar';
import { usePreferences } from '../context/PreferencesContext';

interface HeaderProps {
  state: ResearchWorkflowState;
  topicInput: string;
  setTopicInput: (val: string) => void;
  depth: ResearchDepth;
  setDepth: (depth: ResearchDepth) => void;
  persona: ReportPersona;
  setPersona: (persona: ReportPersona) => void;
  searchScope: SearchScope;
  setSearchScope: (scope: SearchScope) => void;
  redTeamMode: boolean;
  setRedTeamMode: (mode: boolean) => void;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  onOpenLibrary: () => void;
  onOpenUploader: () => void;
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  topicInput,
  setTopicInput,
  depth,
  setDepth,
  persona,
  setPersona,
  searchScope,
  setSearchScope,
  redTeamMode,
  setRedTeamMode,
  onStart,
  onStop,
  onOpenSettings,
  onOpenPresets,
  onOpenLibrary,
  onOpenUploader,
  currentView,
  setCurrentView,
}) => {
  const { theme, setTheme, t } = usePreferences();
  const isRunning = state.status === 'running';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning && topicInput.trim()) {
      onStart();
    }
  };

  const viewOptions: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { id: 'floor', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'planner', label: 'Planner', icon: <Compass className="w-3.5 h-3.5 text-[#6366F1]" /> },
    { id: 'searcher', label: 'Scout', icon: <Search className="w-3.5 h-3.5 text-[#06B6D4]" /> },
    { id: 'reader', label: 'Reader', icon: <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" /> },
    { id: 'critic', label: 'Critic', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#EF4444]" /> },
    { id: 'report', label: 'Whitepaper', icon: <FileText className="w-3.5 h-3.5 text-[#A855F7]" /> },
    { id: 'logs', label: 'Message Bus Logs', icon: <Terminal className="w-3.5 h-3.5 text-gray-700" /> },
  ];

  return (
    <div className="w-full liquid-glass sticky top-0 z-20 shadow-md no-print border-b border-[var(--border-subtle)]">
      {/* 1. Main Top Navbar (Liquid Glass, 72px) */}
      <header className="min-h-[72px] h-auto px-2 py-3 sm:h-[72px] sm:px-6 sm:py-0 flex items-center justify-between gap-1 sm:gap-4 border-b border-[var(--border-subtle)]">
        {/* Logo left */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl liquid-glass-tinted-blue flex items-center justify-center shadow-lg shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[13px] sm:text-lg text-[var(--text-primary)] tracking-tight whitespace-nowrap drop-shadow-sm">
                Research Factory
              </span>
              <span className="hidden sm:inline text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600/40 to-pink-600/40 text-pink-200 font-bold border border-pink-400/30">
                PRO SAAS
              </span>
            </div>
            <p className="text-xs text-[#9AA8D6] hidden sm:block">
              Autonomous 5-Agent Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: System Status Indicator (Apple Liquid Glass Pill) */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-subtle text-xs font-medium border border-[rgba(160,190,255,0.25)]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
            }`}
          />
          <span className="text-white font-medium">
            {isRunning ? (
              <>
                Running:{' '}
                <strong className="capitalize text-pink-300">
                  {state.activeAgent || 'Agents'} Active
                </strong>
              </>
            ) : (
              'System Ready • 5 Agents Idle'
            )}
          </span>
          {state.replanHistory && state.replanHistory.length > 0 && (
            <span className="ml-1 text-[10px] font-mono bg-violet-500/20 text-violet-300 px-2.5 py-0.5 rounded-full border border-violet-400/40 flex items-center gap-1 font-bold">
              <Repeat className="w-2.5 h-2.5" /> {state.replanHistory.length} Replan Loops
            </span>
          )}
        </div>

        {/* Right Section: Glowing Pills & Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* BYOD Files Vault Pill */}
          <button
            type="button"
            onClick={onOpenUploader}
            className="hidden lg:flex items-center gap-1.5 h-[42px] px-3.5 rounded-full liquid-glass-subtle hover:bg-[rgba(160,190,255,0.18)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            title="Upload Custom Data Files (PDF, CSV, TXT)"
          >
            <UploadCloud className="w-4 h-4 text-[#4ADE80]" />
            <span>BYOD</span>
            {state.customDocuments.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono flex items-center justify-center font-bold border border-emerald-400/40">
                {state.customDocuments.length}
              </span>
            )}
          </button>

          {/* Report Archive Pill */}
          <button
            type="button"
            onClick={onOpenLibrary}
            className="hidden lg:flex items-center gap-1.5 h-[42px] px-3.5 rounded-full liquid-glass-subtle hover:bg-[rgba(160,190,255,0.18)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            title="Saved Intelligence Library"
          >
            <Bookmark className="w-4 h-4 text-[#60A5FA]" />
            <span>Archive</span>
          </button>

          {/* Quick Theme Toggle Pill (Cycles through all rich themes) */}
          <button
            type="button"
            onClick={() => {
              const themesOrder: AppTheme[] = ['liquid-glass', 'claymorphism', 'synthwave', 'cyberpunk', 'midnight', 'light', 'dark', 'sepia'];
              const nextIndex = (themesOrder.indexOf(theme) + 1) % themesOrder.length;
              setTheme(themesOrder[nextIndex]);
            }}
            className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-full liquid-glass-subtle hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#F5F7FF] transition-all border border-[rgba(255,255,255,0.10)]"
            title={`Cycle Theme (Current: ${theme})`}
          >
            {theme === 'light' || theme === 'claymorphism' ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : theme === 'synthwave' ? (
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            ) : theme === 'cyberpunk' ? (
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
            )}
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>

          {/* Config / Settings Pill */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 h-10 sm:h-[42px] px-3 sm:px-3.5 rounded-full liquid-glass-subtle hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            title="Model Config & API Keys"
            aria-label="Model Config & API Keys"
          >
            <Sliders className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="hidden lg:inline">{t('config')}</span>
          </button>

          {isRunning ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-1.5 h-[38px] px-4 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all border border-rose-400/40"
            >
              <StopCircle className="w-3.5 h-3.5 animate-spin" />
              <span>Abort</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              title="Launch research"
              aria-label="Launch research"
              disabled={!topicInput.trim()}
              className="flex items-center gap-2 h-10 sm:h-[42px] px-3 sm:px-5 rounded-full bg-[#151A17] hover:bg-[#262E29] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Launch</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Desktop Navigation */}
      <nav
        aria-label="Desktop Agent Navigation"
        className="hidden md:flex h-[46px] bg-[var(--bg-secondary)] px-4 sm:px-6 items-center justify-between border-b border-[var(--border-subtle)] overflow-x-auto text-xs"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[#6B7280] font-semibold text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
            Views:
          </span>
          {viewOptions.map((v) => {
            const isSelected = currentView === v.id;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrentView(v.id)}
                aria-current={isSelected ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border-card)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 font-medium'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-[#6B7280]">
          {state.topic && (
            <span className="truncate max-w-xs font-medium text-[#14181F]">
              Topic: <em>&ldquo;{state.topic}&rdquo;</em>
            </span>
          )}

          {state.report && (
            <button
              type="button"
              onClick={() => setCurrentView('report')}
              className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
            >
              Read Whitepaper &rarr;
            </button>
          )}
        </div>
      </nav>

      {/* 3. Research Command Bar */}
      <div className="px-4 sm:px-6 py-3 bg-[var(--bg-page)] border-b border-[var(--border-subtle)]">
        <form onSubmit={handleSubmit} className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-2.5">
          {/* Wide Pill Topic Input */}
          <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter complex research topic, thesis, or technical domain..."
              disabled={isRunning}
              className="w-full min-w-0 h-[44px] pl-10 pr-24 rounded-full border border-[var(--border-strong)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] transition-all bg-[var(--bg-card)] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={onOpenPresets}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors border border-[var(--border-subtle)] shadow-xs"
              title="Browse Curated Topic Presets"
            >
              Presets
            </button>
          </div>

          {/* Pill Dropdown: Report Persona */}
          <div className="relative min-w-0 w-full xl:w-auto">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as ReportPersona)}
              disabled={isRunning}
              className="w-full min-w-0 h-[44px] appearance-none pl-3 sm:pl-4 pr-8 sm:pr-9 rounded-full border border-[#D1D5DB] focus:border-[#14181F] bg-white text-xs font-semibold text-[#14181F] hover:bg-[#F8FAFC] transition-colors cursor-pointer xl:w-auto"
            >
              <option value="executive">👔 Executive Brief</option>
              <option value="academic">🎓 Academic Survey</option>
              <option value="investment">💼 Investment Memo</option>
              <option value="technical">🛠️ Technical Specs</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pill Dropdown: Depth */}
          <div className="relative min-w-0 w-full xl:w-auto">
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as ResearchDepth)}
              disabled={isRunning}
              className="w-full min-w-0 h-[44px] appearance-none pl-3 sm:pl-4 pr-8 sm:pr-9 rounded-full border border-[#D1D5DB] focus:border-[#14181F] bg-white text-xs font-semibold text-[#14181F] hover:bg-[#F8FAFC] transition-colors cursor-pointer capitalize xl:w-auto"
            >
              <option value="quick">⚡ Quick (4 Sources)</option>
              <option value="standard">🔍 Standard (10 Sources)</option>
              <option value="deep">🔬 Deep (18 Sources)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Red Team Toggle Pill */}
          <button
            type="button"
            onClick={() => setRedTeamMode(!redTeamMode)}
            disabled={isRunning}
            className={`flex w-full xl:w-auto items-center justify-center gap-1.5 h-[44px] px-3 sm:px-4 rounded-full border text-xs font-semibold transition-all min-w-0 ${
              redTeamMode
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
            title="Enable Adversarial Stress-Testing Mode"
          >
            <Flame className={`w-3.5 h-3.5 ${redTeamMode ? 'text-rose-400 animate-pulse' : 'text-[var(--text-muted)]'}`} />
            <span>Red Team</span>
          </button>

          {/* Run button in command bar */}
          <button
            type="submit"
            disabled={isRunning || !topicInput.trim()}
            className="flex w-full xl:w-auto items-center justify-center gap-1.5 h-[44px] px-3 sm:px-6 rounded-full bg-[#151A17] hover:bg-[#262E29] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 min-w-0 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Research</span>
          </button>
        </form>
      </div>
    </div>
  );
};
