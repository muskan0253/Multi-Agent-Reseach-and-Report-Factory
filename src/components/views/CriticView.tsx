'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Shield,
  FileCheck,
  Flame,
  Skull,
  EyeOff,
  RefreshCw,
  Search,
  PenTool,
} from 'lucide-react';
import { CriticReview, AgentInfo, ResearchWorkflowState } from '../../lib/types';
import { AgentStatePanel } from '../AgentStatePanel';

interface CriticViewProps {
  critic?: CriticReview;
  agent: AgentInfo;
  workflowStatus?: ResearchWorkflowState['status'];
  workflowError?: string;
}

export const CriticView: React.FC<CriticViewProps> = ({
  critic,
  agent,
  workflowStatus,
  workflowError,
}) => {
  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_12px_rgba(16,24,40,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#14181F]">
                Stage 04: Epistemic Critic &amp; Loop Auditor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-50 text-rose-800 font-bold border border-rose-200">
                {agent.status}
              </span>
              {critic?.redTeamAudit && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3 text-rose-600" />
                  Red Team Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280]">
              Evaluates source credibility, audits bias, triggers targeted search replanning loops, and performs post-draft verification.
            </p>
          </div>
        </div>

        {critic && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#9CA3AF] block uppercase">
              Reliability Index
            </span>
            <span className="text-2xl font-mono font-extrabold text-[#EF4444]">
              {critic.overallCredibilityScore}/100
            </span>
          </div>
        )}
      </div>

      {!critic ? (
        <AgentStatePanel
          stageName="Epistemic Critic"
          outputName="epistemic audit"
          status={agent.status}
          workflowStatus={workflowStatus}
          icon={<ShieldCheck className="w-10 h-10 text-[#EF4444]" aria-hidden="true" />}
          currentTask={agent.currentTask}
          errorMessage={workflowError}
          idleMessage="The Critic will audit findings and the draft after the Reader and Synthesizer have produced their outputs."
        />
      ) : (
        <div className="space-y-6">
          {/* Agentic Decision & Replanning Directive Callout */}
          <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-[0_2px_8px_rgba(16,24,40,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 text-amber-600" />
                  Orchestration Feedback Status
                </span>
                <span className="text-xs font-bold text-[#14181F]">
                  Decision: <span className="text-[#D97706] uppercase">{critic.criticDecision || 'Approved'}</span>
                </span>
              </div>
              <p className="text-xs text-[#4B5563]">
                {critic.criticDecision === 'request_more_evidence'
                  ? 'Critic detected evidence gaps and triggered follow-up search directives to Searcher & Reader.'
                  : 'Evidence threshold satisfied; Critic cleared synthesis pass to Writer with specific epistemic constraints.'}
              </p>
            </div>

            {critic.followUpSearchQueries && critic.followUpSearchQueries.length > 0 && (
              <div className="text-xs bg-[#FFFBEB] px-3.5 py-1.5 rounded-full border border-amber-200 text-amber-900 font-semibold shrink-0">
                <span className="font-mono font-bold text-amber-700">{critic.followUpSearchQueries.length}</span> follow-up queries dispatched
              </div>
            )}
          </div>

          {/* Adversarial Red Team Stress Test Section */}
          {critic.redTeamAudit && (
            <div className="bg-white p-5 rounded-2xl border border-rose-300 shadow-[0_2px_12px_rgba(16,24,40,0.06)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F2F4] pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-[#14181F] uppercase tracking-wider">
                    Adversarial Red Team Stress-Test Audit
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
                  Hypothesis Deconstruction
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#FEF2F2]/60 p-4 rounded-xl border border-rose-200 space-y-2">
                  <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" /> Core Vulnerabilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {critic.redTeamAudit.vulnerabilitiesIdentified.map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FFFBEB]/60 p-4 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 uppercase">
                    <Shield className="w-3.5 h-3.5" /> Counter-Theses
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {critic.redTeamAudit.counterTheses.map((ct, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{ct}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FEF2F2]/60 p-4 rounded-xl border border-rose-200 space-y-2">
                  <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5 uppercase">
                    <Skull className="w-3.5 h-3.5" /> Worst-Case Scenarios
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {critic.redTeamAudit.worstCaseScenarios.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF5FF]/60 p-4 rounded-xl border border-purple-200 space-y-2">
                  <span className="text-[11px] font-bold text-purple-800 flex items-center gap-1.5 uppercase">
                    <EyeOff className="w-3.5 h-3.5" /> Blindspots Flagged
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {critic.redTeamAudit.blindspotsFlagged.map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Scorecards & Domain Matrix (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Reliability Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EF4444] flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Epistemic Credibility Rating
                  </span>
                  <span className="text-xs font-mono text-[#6B7280]">
                    {critic.verifiedFactsCount} Claims / {critic.totalSourcesEvaluated} Sources
                  </span>
                </div>
                <div className="w-full bg-[#F1F2F4] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444] rounded-full transition-all duration-500"
                    style={{ width: `${critic.overallCredibilityScore}%` }}
                  />
                </div>
                <p className="text-xs text-[#6B7280]">
                  Epistemological audit verifies domain authority and methodological consistency across external institutional baselines.
                </p>
              </div>

              {/* Source Scorecards Table */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14181F] block">
                  Primary Domain Scorecards ({critic.sourceScorecards?.length})
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px]">
                        <th className="pb-2">Domain</th>
                        <th className="pb-2">Authority</th>
                        <th className="pb-2">Bias Profile</th>
                        <th className="pb-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] text-[#334155]">
                      {critic.sourceScorecards?.map((sc, i) => (
                        <tr key={i} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 font-mono text-[#2563EB] font-semibold">{sc.domain}</td>
                          <td className="py-2.5">{sc.authorityLevel}</td>
                          <td className="py-2.5 text-[#6B7280]">{sc.biasRating}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-[#EF4444]">
                            {sc.credibilityScore}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Methodology Notes */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14181F] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#16A34A]" /> Methodology &amp; Provenance Notes
                </span>
                <ul className="space-y-2">
                  {critic.methodologyNotes?.map((note, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#4B5563] flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Flagged Nuances & Writer Directives (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Flagged Claims & Counter-Perspectives */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  <AlertTriangle className="w-4 h-4" />
                  Flagged Claims &amp; Risk Nuances ({critic.questionableClaims?.length})
                </div>
                <div className="space-y-3">
                  {critic.questionableClaims?.map((qc, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFBEB] p-4 rounded-xl border border-amber-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#14181F]">Claim Under Audit</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase font-semibold">
                          {qc.risk} Risk
                        </span>
                      </div>
                      <p className="font-semibold text-[#14181F]">&ldquo;{qc.claim}&rdquo;</p>
                      <p className="text-[#D97706]">
                        <strong className="text-amber-800">Issue:</strong> {qc.issue}
                      </p>
                      <p className="text-[#4B5563] bg-white p-2.5 rounded-lg border border-amber-200 text-[11px]">
                        <strong className="text-[#14181F] block mb-0.5">Directives for Writer:</strong>
                        {qc.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Writer Synthesis Directives */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                  <CheckCircle2 className="w-4 h-4" />
                  Mandatory Directives for Writer Agent
                </div>
                <ul className="space-y-2">
                  {critic.synthesisGuidanceForWriter?.map((g, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#14181F] flex items-start gap-2.5 bg-[#FAF5FF] p-3 rounded-xl border border-purple-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0 mt-1.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
