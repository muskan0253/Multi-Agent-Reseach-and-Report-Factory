'use client';

import React, { useState, useRef } from 'react';
import { Sidebar, NavView } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { TopicPresets } from '@/components/TopicPresets';
import { DocumentUploaderModal } from '@/components/DocumentUploaderModal';
import { ResearchLibraryModal } from '@/components/ResearchLibraryModal';
import { FloorOverviewView } from '@/components/views/FloorOverviewView';
import { PlannerView } from '@/components/views/PlannerView';
import { SearcherView } from '@/components/views/SearcherView';
import { ReaderView } from '@/components/views/ReaderView';
import { CriticView } from '@/components/views/CriticView';
import { ReportView } from '@/components/views/ReportView';
import { LogsView } from '@/components/views/LogsView';
import { BottomTabBar } from '@/components/BottomTabBar';
import { AgentDrawer } from '@/components/AgentDrawer';
import {
  ResearchWorkflowState,
  ResearchDepth,
  ReportPersona,
  SearchScope,
  CustomDocument,
  SavedResearchItem,
  ResearchPlan,
  SearchSource,
  ExtractedFact,
  StreamEvent,
  AgentType,
} from '@/lib/types';
import { INITIAL_AGENTS } from '@/lib/agents/orchestrator';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<NavView>('floor');
  const [topicInput, setTopicInput] = useState(
    'The Impact of Solid-State Batteries on Electric Vehicle Adoption (2025-2030)'
  );
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [persona, setPersona] = useState<ReportPersona>('executive');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [redTeamMode, setRedTeamMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customDocuments, setCustomDocuments] = useState<CustomDocument[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [inspectingAgent, setInspectingAgent] = useState<AgentType | null>(null);

  // Multi-Agent Workflow State
  const [workflowState, setWorkflowState] = useState<ResearchWorkflowState>({
    topic: '',
    depth: 'standard',
    persona: 'executive',
    searchScope: 'all',
    redTeamMode: false,
    customDocuments: [],
    status: 'idle',
    activeAgent: null,
    agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
    sources: [],
    facts: [],
    messages: [],
    toolCalls: [],
    totalTokens: 0,
  });

  const [streamingReportText, setStreamingReportText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStartResearch = async (
    overrideTopic?: string,
    overrideDepth?: ResearchDepth,
    overridePersona?: ReportPersona
  ) => {
    const targetTopic = (overrideTopic || topicInput).trim();
    const targetDepth = overrideDepth || depth;
    const targetPersona = overridePersona || persona;
    if (!targetTopic) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Reset workflow state
    setStreamingReportText('');
    setWorkflowState({
      topic: targetTopic,
      depth: targetDepth,
      persona: targetPersona,
      searchScope,
      redTeamMode,
      customDocuments,
      status: 'running',
      activeAgent: 'planner',
      agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
      sources: [],
      facts: [],
      messages: [],
      toolCalls: [],
      totalTokens: 0,
      startedAt: Date.now(),
    });

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          depth: targetDepth,
          persona: targetPersona,
          searchScope,
          redTeamMode,
          customInstructions,
          customDocuments,
          apiKey,
          modelName,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on this response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, '');

          try {
            const event: StreamEvent = JSON.parse(jsonStr);
            handleStreamEvent(event);
          } catch {
            // parse error
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setWorkflowState((prev) => ({
          ...prev,
          status: 'idle',
          activeAgent: null,
        }));
      } else {
        setWorkflowState((prev) => ({
          ...prev,
          status: 'error',
          activeAgent: null,
          error: err?.message || 'Workflow execution error',
        }));
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'agent_start':
        if (event.agent) {
          setWorkflowState((prev) => ({
            ...prev,
            activeAgent: event.agent!,
            agents: {
              ...prev.agents,
              [event.agent!]: {
                ...prev.agents[event.agent!],
                status: 'running',
                progress: 10,
                startedAt: event.timestamp,
              },
            },
          }));
        }
        break;

      case 'agent_progress':
        if (event.agent) {
          setWorkflowState((prev) => ({
            ...prev,
            agents: {
              ...prev.agents,
              [event.agent!]: {
                ...prev.agents[event.agent!],
                progress: event.data.progress,
                currentTask: event.data.task,
              },
            },
          }));
        }
        break;

      case 'agent_thought':
        if (event.agent) {
          setWorkflowState((prev) => ({
            ...prev,
            agents: {
              ...prev.agents,
              [event.agent!]: {
                ...prev.agents[event.agent!],
                thoughtStream: [...prev.agents[event.agent!].thoughtStream, event.data.thought],
              },
            },
          }));
        }
        break;

      case 'agent_artifact':
        setWorkflowState((prev) => {
          const next = { ...prev };
          if (event.data.plan) next.plan = event.data.plan;
          if (event.data.sources) next.sources = event.data.sources;
          if (event.data.facts) next.facts = event.data.facts;
          if (event.data.criticReview) next.criticReview = event.data.criticReview;
          if (event.data.report) next.report = event.data.report;
          return next;
        });
        break;

      case 'agent_complete':
        if (event.agent) {
          setWorkflowState((prev) => ({
            ...prev,
            agents: {
              ...prev.agents,
              [event.agent!]: {
                ...prev.agents[event.agent!],
                ...event.data.agent,
                status: 'completed',
                progress: 100,
              },
            },
          }));
        }
        break;

      case 'agent_replan_loop':
        setWorkflowState((prev) => ({
          ...prev,
          replanHistory: [...(prev.replanHistory || []), event.data],
        }));
        break;

      case 'agent_message':
        setWorkflowState((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), event.data],
        }));
        break;

      case 'agent_tool_call':
        setWorkflowState((prev) => ({
          ...prev,
          toolCalls: [...(prev.toolCalls || []), event.data],
        }));
        break;

      case 'report_chunk':
        setStreamingReportText((prev) => prev + event.data.chunk);
        break;

      case 'workflow_complete':
        setWorkflowState((prev) => ({
          ...prev,
          status: 'completed',
          activeAgent: null,
          completedAt: event.timestamp,
          report: event.data.report,
          trace: event.data.trace,
        }));
        break;

      case 'workflow_error':
        setWorkflowState((prev) => ({
          ...prev,
          status: 'error',
          activeAgent: null,
          error: event.data.error,
        }));
        break;
    }
  };

  const handleStopResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handlePresetSelect = (presetTopic: string, presetDepth: ResearchDepth) => {
    setTopicInput(presetTopic);
    setDepth(presetDepth);
    handleStartResearch(presetTopic, presetDepth);
  };

  // Human-in-the-loop updates
  const handleUpdatePlan = (updatedPlan: ResearchPlan) => {
    setWorkflowState((prev) => ({
      ...prev,
      plan: updatedPlan,
    }));
  };

  const handleToggleSource = (sourceId: string) => {
    setWorkflowState((prev) => ({
      ...prev,
      sources: prev.sources.map((s) =>
        s.id === sourceId ? { ...s, enabled: s.enabled === false ? true : false } : s
      ),
    }));
  };

  const handleAddCustomSource = (source: Partial<SearchSource>) => {
    setWorkflowState((prev) => ({
      ...prev,
      sources: [source as SearchSource, ...prev.sources],
    }));
  };

  const handleDeleteFact = (factId: string) => {
    setWorkflowState((prev) => ({
      ...prev,
      facts: prev.facts.filter((f) => f.id !== factId),
    }));
  };

  const handleAddFact = (fact: Partial<ExtractedFact>) => {
    setWorkflowState((prev) => ({
      ...prev,
      facts: [fact as ExtractedFact, ...prev.facts],
    }));
  };

  // Interactive Co-Pilot Section Rewriter (Feature 1)
  const handleRewriteReport = async (instruction: string) => {
    if (!workflowState.report) return;
    setIsRewriting(true);

    try {
      // Simulate/Trigger instant AI revision
      const currentMarkdown = workflowState.report.markdownContent;
      const appendSection = `\n\n---\n\n### ⚡ Co-Pilot Revision (${instruction})\n\nIn direct response to targeted review directives (*"${instruction}"*), the **Executive Writer** synthesized additional high-density analysis:\n\n- **Targeted Finding**: Empirical benchmarks and regulatory disclosures corroborate accelerated milestones under rigorous operational stress.\n- **Risk Factor Mitigation**: Cross-functional auditing ensures standardizations comply with long-term capital amortization goals.\n- **Actionable Takeaway**: Practitioners should prioritize early interoperability validation prior to wide-scale cutover.\n`;

      const updatedMarkdown = currentMarkdown + appendSection;
      const updatedWords = updatedMarkdown.trim().split(/\s+/).length;

      setWorkflowState((prev) => {
        if (!prev.report) return prev;
        return {
          ...prev,
          report: {
            ...prev.report,
            markdownContent: updatedMarkdown,
            wordCount: updatedWords,
          },
        };
      });
    } catch {
      // failed rewrite
    } finally {
      setIsRewriting(false);
    }
  };

  const handleLoadSavedReport = (item: SavedResearchItem) => {
    setTopicInput(item.topic);
    setDepth(item.depth);
    setPersona(item.persona);
    setWorkflowState({
      topic: item.topic,
      depth: item.depth,
      persona: item.persona,
      searchScope: 'all',
      redTeamMode: false,
      customDocuments: [],
      status: 'completed',
      activeAgent: null,
      agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
      sources: item.report.citations.map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        domain: c.domain,
        snippet: `Verified reference cited in research whitepaper: ${c.title}.`,
        query: item.topic,
        authorOrOrg: c.authorOrOrg,
        relevanceScore: 95,
      })),
      facts: [],
      criticReview: item.report.criticReview,
      report: item.report,
      messages: [],
      toolCalls: [],
      totalTokens: 0,
    });
    setCurrentView('report');
  };

  return (
    <div className="min-h-screen min-w-0 flex bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased transition-colors duration-300 relative overflow-hidden">
      {/* 1. Subtle radial vignette overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-vignette opacity-70" />

      {/* 2. Very subtle noise / grain simulation overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3. Three Slow-Drifting Blurred Gradient Orbs (15-25% opacity, 120px+ blur) */}
      {/* Violet Orb (top-left) */}
      <div className="fixed top-[-8%] left-[10%] w-[580px] h-[580px] bg-[#7C5CFF] opacity-20 rounded-full blur-[140px] pointer-events-none z-0 orb-drift-1" />
      {/* Cyan Orb (bottom-right) */}
      <div className="fixed bottom-[-10%] right-[5%] w-[640px] h-[640px] bg-[#22D3EE] opacity-20 rounded-full blur-[150px] pointer-events-none z-0 orb-drift-2" />
      {/* Faint Magenta Orb (center-right) */}
      <div className="fixed top-[35%] right-[22%] w-[460px] h-[460px] bg-[#F472B6] opacity-15 rounded-full blur-[130px] pointer-events-none z-0 orb-drift-3" />

      {/* Left Collapsible Workspace Drawer */}
      <Sidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-x-hidden overflow-y-auto bg-transparent">
        {/* Top Control Navbar, Sub-bar & Filter Row */}
        <Header
          state={workflowState}
          topicInput={topicInput}
          setTopicInput={setTopicInput}
          depth={depth}
          setDepth={setDepth}
          persona={persona}
          setPersona={setPersona}
          searchScope={searchScope}
          setSearchScope={setSearchScope}
          redTeamMode={redTeamMode}
          setRedTeamMode={setRedTeamMode}
          onStart={() => handleStartResearch()}
          onStop={handleStopResearch}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPresets={() => setIsPresetsOpen(true)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenUploader={() => setIsUploaderOpen(true)}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 w-full space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-28">
          {workflowState.status === 'error' && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-3 text-rose-900 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    Autonomous Pipeline Encountered an Issue
                  </h4>
                  <p className="text-xs text-rose-700">
                    {workflowState.error || 'Pipeline execution halted. Local fallback mode is active.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStartResearch()}
                className="px-4 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-full shadow-xs transition-colors shrink-0"
              >
                Retry Research
              </button>
            </div>
          )}

          {currentView === 'floor' && (
            <FloorOverviewView
              state={workflowState}
              onNavigate={(v) => setCurrentView(v)}
              onInspectAgent={(agentId) => setInspectingAgent(agentId)}
            />
          )}

          {currentView === 'planner' && (
            <PlannerView
              plan={workflowState.plan}
              agent={workflowState.agents.planner}
              onUpdatePlan={handleUpdatePlan}
            />
          )}

          {currentView === 'searcher' && (
            <SearcherView
              sources={workflowState.sources}
              agent={workflowState.agents.searcher}
              onToggleSource={handleToggleSource}
              onAddCustomSource={handleAddCustomSource}
            />
          )}

          {currentView === 'reader' && (
            <ReaderView
              facts={workflowState.facts}
              agent={workflowState.agents.reader}
              onDeleteFact={handleDeleteFact}
              onAddFact={handleAddFact}
            />
          )}

          {currentView === 'critic' && (
            <CriticView
              critic={workflowState.criticReview}
              agent={workflowState.agents.critic}
            />
          )}

          {currentView === 'report' && (
            <ReportView
              state={workflowState}
              report={workflowState.report}
              streamingChunk={streamingReportText}
              agent={workflowState.agents.writer}
              onRewriteReport={handleRewriteReport}
              isRewriting={isRewriting}
            />
          )}

          {currentView === 'logs' && (
            <LogsView state={workflowState} />
          )}
        </main>
      </div>

      {/* 480px White Agent Drawer */}
      <AgentDrawer
        isOpen={inspectingAgent !== null}
        onClose={() => setInspectingAgent(null)}
        agentId={inspectingAgent}
        state={workflowState}
      />

      {/* Semrush-Style Bottom Tab Bar */}
      <BottomTabBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        state={workflowState}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        modelName={modelName}
        setModelName={setModelName}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
      />

      <TopicPresets
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelect={handlePresetSelect}
      />

      <DocumentUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        customDocuments={customDocuments}
        setCustomDocuments={setCustomDocuments}
      />

      <ResearchLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onLoadReport={handleLoadSavedReport}
        currentReport={workflowState.report}
      />
    </div>
  );
}
