'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Search,
  BookOpen,
  ShieldCheck,
  PenTool,
  Terminal,
  Sliders,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  UploadCloud,
  FileText,
} from 'lucide-react';
import { ResearchWorkflowState, AgentType } from '../lib/types';
import { usePreferences } from '../context/PreferencesContext';

export type NavView = 'floor' | 'planner' | 'searcher' | 'reader' | 'critic' | 'report' | 'logs';

interface SidebarProps {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  state: ResearchWorkflowState;
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  onOpenLibrary: () => void;
  onOpenUploader: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  state,
  onOpenSettings,
  onOpenPresets,
  onOpenLibrary,
  onOpenUploader,
}) => {
  const { t } = usePreferences();
  const [isCollapsed, setIsCollapsed] = useState(false); // expanded by default for full sidebar navigation visibility
  const isRunning = state.status === 'running';

  const navItems = [
    {
      id: 'floor' as NavView,
      label: t('overview'),
      icon: <LayoutDashboard className="w-4 h-4 text-[#14181F] dark:text-gray-200" />,
    },
    {
      id: 'planner' as NavView,
      agentId: 'planner' as AgentType,
      label: `1. ${t('planner')}`,
      icon: <Compass className="w-4 h-4 text-[#6366F1]" />,
    },
    {
      id: 'searcher' as NavView,
      agentId: 'searcher' as AgentType,
      label: `2. ${t('scout')}`,
      icon: <Search className="w-4 h-4 text-[#06B6D4]" />,
    },
    {
      id: 'reader' as NavView,
      agentId: 'reader' as AgentType,
      label: `3. ${t('reader')}`,
      icon: <BookOpen className="w-4 h-4 text-[#F59E0B]" />,
    },
    {
      id: 'critic' as NavView,
      agentId: 'critic' as AgentType,
      label: `4. ${t('critic')}`,
      icon: <ShieldCheck className="w-4 h-4 text-[#EF4444]" />,
    },
    {
      id: 'report' as NavView,
      agentId: 'writer' as AgentType,
      label: `5. ${t('whitepaper')}`,
      icon: <PenTool className="w-4 h-4 text-[#A855F7]" />,
    },
    {
      id: 'logs' as NavView,
      label: t('messageLogs'),
      icon: <Terminal className="w-4 h-4 text-[#4B5563] dark:text-gray-400" />,
    },
  ];

  return (
    <aside
      className={`hidden md:flex liquid-glass !rounded-none border-r border-[rgba(255,255,255,0.08)] flex-col h-screen sticky top-0 shrink-0 select-none z-20 transition-all duration-200 no-print ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[rgba(160,190,255,0.2)] flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl liquid-glass-tinted-blue flex items-center justify-center shrink-0 shadow-md">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="font-bold text-xs text-white block truncate tracking-wider uppercase">
              WORKSPACE
            </span>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl liquid-glass-tinted-blue flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          className="p-1 rounded-full text-[#9AA8D6] hover:text-white hover:bg-[rgba(160,190,255,0.15)] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const isSelected = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              aria-label={item.label}
              aria-current={isSelected ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
              } rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.18)] text-[#F5F7FF] font-bold shadow-sm'
                  : 'text-[rgba(255,255,255,0.7)] hover:text-[#F5F7FF] hover:bg-[rgba(255,255,255,0.06)]'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="text-xs truncate">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-[rgba(160,190,255,0.18)]" />

        {/* Workspace Tools */}
        <button
          onClick={onOpenUploader}
          aria-label={t('vault')}
          title={isCollapsed ? t('vault') : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <UploadCloud className="w-4 h-4 text-[#4ADE80] shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium truncate">{t('vault')}</span>}
        </button>

        <button
          onClick={onOpenLibrary}
          aria-label={t('archive')}
          title={isCollapsed ? t('archive') : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Bookmark className="w-4 h-4 text-[#60A5FA] shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium truncate">{t('archive')}</span>}
        </button>

        <button
          onClick={onOpenPresets}
          aria-label={t('presets')}
          title={isCollapsed ? t('presets') : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Sparkles className="w-4 h-4 text-[#FBBF24] shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium truncate">{t('presets')}</span>}
        </button>

        <button
          onClick={onOpenSettings}
          aria-label={t('config')}
          title={isCollapsed ? t('config') : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Sliders className="w-4 h-4 text-[#C5D0F5] shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium truncate">{t('config')}</span>}
        </button>
      </div>
    </aside>
  );
};
