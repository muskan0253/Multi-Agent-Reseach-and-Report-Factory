'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Copy,
  Download,
  Printer,
  FileJson,
  Check,
  Presentation,
  Volume2,
  BarChart3,
  Wand2,
} from 'lucide-react';
import { FinalReport, ResearchWorkflowState, AgentInfo } from '../../lib/types';
import { AudioBriefingPlayer } from '../AudioBriefingPlayer';
import { PresentationSlideDeck } from '../PresentationSlideDeck';
import { DataVisualizer } from '../DataVisualizer';
import { ReportCopilot } from '../ReportCopilot';
import { ReportViewer } from '../ReportViewer';

interface ReportViewProps {
  state: ResearchWorkflowState;
  report?: FinalReport;
  streamingChunk?: string;
  agent: AgentInfo;
  onRewriteReport?: (instruction: string) => void;
  isRewriting?: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({
  state,
  report,
  streamingChunk,
  agent,
  onRewriteReport,
  isRewriting = false,
}) => {
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Top Banner (Theme Responsive Card) */}
      <div className="liquid-glass p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-tinted-blue flex items-center justify-center text-purple-300 shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-current">
                Stage 05: Executive Synthesizer
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase liquid-glass-subtle font-bold">
                {agent.status}
              </span>
              {state.activeAgent === 'writer' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 animate-pulse font-bold border border-purple-400/30">
                  Live Streaming Draft...
                </span>
              )}
            </div>
            <p className="text-xs opacity-70">
              Synthesizes verified facts, comparative matrices, and critic directives into an executive whitepaper.
            </p>
          </div>
        </div>

        {report?.slides && report.slides.length > 0 && (
          <button
            onClick={() => setIsSlideDeckOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-subtle hover:opacity-100 text-xs font-semibold text-current transition-all shadow-xs shrink-0"
          >
            <Presentation className="w-4 h-4" />
            <span>Open Presentation Slides</span>
          </button>
        )}
      </div>

      {/* 2-Speaker AI Podcast Player */}
      {report?.podcastDialogue && (
        <AudioBriefingPlayer
          dialogue={report.podcastDialogue}
          topic={report.topic}
        />
      )}

      {/* Interactive Report Co-Pilot */}
      {report && onRewriteReport && (
        <ReportCopilot
          onRewriteRequest={onRewriteReport}
          isRewriting={isRewriting}
        />
      )}

      {/* Interactive Quantitative Data Visualizer */}
      {state.facts.length > 0 && (
        <DataVisualizer
          facts={state.facts}
          criticReview={state.criticReview}
        />
      )}

      {/* Main Whitepaper Viewer (Centered 760px column) */}
      <ReportViewer
        state={state}
        report={report}
        streamingChunk={streamingChunk}
      />

      {/* Slide Deck Modal */}
      {report?.slides && (
        <PresentationSlideDeck
          isOpen={isSlideDeckOpen}
          onClose={() => setIsSlideDeckOpen(false)}
          slides={report.slides}
          topic={report.topic}
        />
      )}
    </div>
  );
};
