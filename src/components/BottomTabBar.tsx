'use client';

import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Search,
  BookOpen,
  ShieldCheck,
  PenTool,
  Terminal,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { ResearchWorkflowState, AgentType } from '../lib/types';

interface BottomTabBarProps {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  state: ResearchWorkflowState;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentView,
  setCurrentView,
  state,
}) => {
  const isRunning = state.status === 'running';

  const tabs: {
    id: NavView;
    agentId?: AgentType;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'floor',
      label: 'Overview',
      icon: (active) => <LayoutDashboard className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />,
      color: '#151A17',
    },
    {
      id: 'planner',
      agentId: 'planner',
      label: 'Planner',
      icon: (active) => <Compass className={`w-5 h-5 ${active ? 'text-white' : 'text-[#6366F1]'}`} />,
      color: '#6366F1',
    },
    {
      id: 'searcher',
      agentId: 'searcher',
      label: 'Scout',
      icon: (active) => <Search className={`w-5 h-5 ${active ? 'text-white' : 'text-[#06B6D4]'}`} />,
      color: '#06B6D4',
    },
    {
      id: 'reader',
      agentId: 'reader',
      label: 'Reader',
      icon: (active) => <BookOpen className={`w-5 h-5 ${active ? 'text-white' : 'text-[#F59E0B]'}`} />,
      color: '#F59E0B',
    },
    {
      id: 'critic',
      agentId: 'critic',
      label: 'Critic',
      icon: (active) => <ShieldCheck className={`w-5 h-5 ${active ? 'text-white' : 'text-[#EF4444]'}`} />,
      color: '#EF4444',
    },
    {
      id: 'report',
      agentId: 'writer',
      label: 'Synthesizer',
      icon: (active) => <PenTool className={`w-5 h-5 ${active ? 'text-white' : 'text-[#A855F7]'}`} />,
      color: '#A855F7',
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: (active) => <Terminal className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />,
      color: '#151A17',
    },
  ];

  return (
    <nav
      aria-label="Main Agent Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-page)] border-t border-[var(--border-subtle)] shadow-[0_-2px_12px_rgba(16,24,40,0.12)] px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] flex md:hidden items-center justify-center no-print"
    >
      <div className="flex items-center justify-between gap-0.5 w-full overflow-hidden">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const agent = tab.agentId ? state.agents[tab.agentId] : undefined;
          const isAgentRunning = agent?.status === 'running';

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-[#151A17] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#14181F] hover:bg-[#F1F2F4]'
              }`}
            >
              {isAgentRunning && !isActive && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
              <div className="mb-0.5">{tab.icon(isActive)}</div>
              <span className={`max-w-full truncate text-[9px] font-medium tracking-tight ${isActive ? 'text-white font-semibold' : 'text-[#6B7280]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
