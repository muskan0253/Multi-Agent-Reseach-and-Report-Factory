import {
  AgentType,
  AgentInfo,
  ResearchWorkflowState,
  StreamEvent,
  ResearchPlan,
  SearchSource,
  ExtractedFact,
  CriticReview,
  FinalReport,
  ResearchDepth,
  ReportPersona,
  SearchScope,
  CustomDocument,
  ReplanLoopRecord,
  AgentMessage,
  ToolCallRecord,
  SharedRunMemory,
  ExecutionTrace,
} from '../types';
import { PlannerAgent } from './planner';
import { SearcherAgent } from './searcher';
import { ReaderAgent } from './reader';
import { CriticAgent } from './critic';
import { WriterAgent } from './writer';
import { GenerateOptions } from './aiService';
import { AgentMessageBus } from './messageBus';
import { WebSearchTool } from '../tools/searchTool';
import { DocumentParserTool } from '../tools/documentParserTool';
import { ScoringRubricTool } from '../tools/scoringRubricTool';

export const INITIAL_AGENTS: Record<AgentType, AgentInfo> = {
  planner: {
    id: 'planner',
    name: 'Strategic Planner',
    role: 'Research Architect & Scope Deconstructor',
    avatar: '🧭',
    color: '#3B82F6',
    description: 'Maps out analytical taxonomy, sub-questions, hypotheses, and targeted search vectors.',
    status: 'idle',
    progress: 0,
    thoughtStream: [],
    logs: [],
  },
  searcher: {
    id: 'searcher',
    name: 'Literature Scout',
    role: 'Web & Primary Source Retriever',
    avatar: '🔍',
    color: '#10B981',
    description: 'Executes multi-perspective search queries and gathers authoritative source candidates.',
    status: 'idle',
    progress: 0,
    thoughtStream: [],
    logs: [],
  },
  reader: {
    id: 'reader',
    name: 'Deep Reader',
    role: 'Evidence & Metric Extractor',
    avatar: '📖',
    color: '#F59E0B',
    description: 'Mines source documents to extract quantitative metrics, findings, quotes, and data tables.',
    status: 'idle',
    progress: 0,
    thoughtStream: [],
    logs: [],
  },
  critic: {
    id: 'critic',
    name: 'Epistemic Critic',
    role: 'Fact Checker & Bias Auditor',
    avatar: '⚖️',
    color: '#EF4444',
    description: 'Audits source credibility, tests claim consistency, detects bias, and grades evidence strength.',
    status: 'idle',
    progress: 0,
    thoughtStream: [],
    logs: [],
  },
  writer: {
    id: 'writer',
    name: 'Executive Synthesizer',
    role: 'Lead Report & Citation Author',
    avatar: '✍️',
    color: '#8B5CF6',
    description: 'Synthesizes verified findings into a polished, structured report with live citations.',
    status: 'idle',
    progress: 0,
    thoughtStream: [],
    logs: [],
  },
};

export class ResearchOrchestrator {
  private state: ResearchWorkflowState;
  private onEvent?: (event: StreamEvent) => void;
  private aiOptions: GenerateOptions;
  private messageBus: AgentMessageBus;
  private memory: SharedRunMemory;

  constructor(
    topic: string,
    depth: ResearchDepth = 'standard',
    persona: ReportPersona = 'executive',
    searchScope: SearchScope = 'all',
    redTeamMode: boolean = false,
    customInstructions?: string,
    customDocuments: CustomDocument[] = [],
    aiOptions: GenerateOptions = {},
    onEvent?: (event: StreamEvent) => void
  ) {
    this.aiOptions = aiOptions;
    this.onEvent = onEvent;
    this.messageBus = new AgentMessageBus();

    this.memory = {
      verifiedFacts: [],
      rejectedSources: [],
      openQuestions: [],
      activeHypotheses: [],
      knowledgeGaps: [],
      replanCount: 0,
    };

    this.state = {
      topic,
      depth,
      persona,
      searchScope,
      redTeamMode,
      customInstructions,
      customDocuments,
      status: 'idle',
      activeAgent: null,
      agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
      sources: [],
      facts: [],
      iterationCount: 1,
      replanHistory: [],
      messages: [],
      toolCalls: [],
      totalTokens: 0,
    };

    // Forward messages to stream and state
    this.messageBus.subscribe((msg: AgentMessage) => {
      this.state.messages.push(msg);
      this.emit({
        type: 'agent_message',
        agent: msg.from,
        timestamp: msg.timestamp,
        data: msg,
      });
    });
  }

  private emit(event: StreamEvent) {
    this.onEvent?.(event);
  }

  private updateAgent(agentId: AgentType, update: Partial<AgentInfo>) {
    this.state.agents[agentId] = {
      ...this.state.agents[agentId],
      ...update,
    };
  }

  private recordToolCall(
    agent: AgentType,
    toolName: string,
    input: any,
    output: any,
    durationMs: number,
    success: boolean,
    error?: string
  ): ToolCallRecord {
    const rec: ToolCallRecord = {
      id: `tool-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agent,
      toolName,
      timestamp: Date.now(),
      input,
      output,
      durationMs,
      success,
      error,
    };
    this.state.toolCalls.push(rec);
    this.emit({
      type: 'agent_tool_call',
      agent,
      timestamp: rec.timestamp,
      data: rec,
    });
    return rec;
  }

  private recordReplanLoop(
    from: AgentType,
    to: AgentType,
    reason: string,
    details?: string,
    queryBefore?: string[],
    queryAfter?: string[],
    scoreBefore?: number,
    scoreAfter?: number
  ) {
    const loopRecord: ReplanLoopRecord = {
      loopNumber: (this.state.replanHistory?.length || 0) + 1,
      from,
      to,
      reason,
      timestamp: Date.now(),
      details,
      queryBefore,
      queryAfter,
      scoreBefore,
      scoreAfter,
    };

    if (!this.state.replanHistory) {
      this.state.replanHistory = [];
    }
    this.state.replanHistory.push(loopRecord);
    this.memory.replanCount++;

    this.emit({
      type: 'agent_replan_loop',
      agent: from,
      timestamp: Date.now(),
      data: loopRecord,
    });
  }

  public async run(): Promise<ResearchWorkflowState> {
    this.state.status = 'running';
    this.state.startedAt = Date.now();

    this.emit({
      type: 'workflow_start',
      timestamp: Date.now(),
      data: {
        topic: this.state.topic,
        depth: this.state.depth,
        persona: this.state.persona,
        redTeamMode: this.state.redTeamMode,
      },
    });

    try {
      // -------------------------------------------------------------
      // STAGE 1: PLANNER AGENT (Initial Research Strategy)
      // -------------------------------------------------------------
      const plan = await this.runPlanner();
      plan.persona = this.state.persona;
      this.state.plan = plan;

      this.memory.openQuestions = [...plan.subQuestions];
      this.memory.activeHypotheses = [...plan.hypotheses];

      this.messageBus.publish(
        'planner',
        'searcher',
        'task',
        {
          searchQueries: plan.searchQueries,
          hypotheses: plan.hypotheses,
          depth: plan.depth,
        },
        'Formulated research taxonomy, sub-questions, and initial search query vectors.'
      );

      // -------------------------------------------------------------
      // STAGE 2: SEARCHER AGENT (First Retrieval Pass)
      // -------------------------------------------------------------
      let sources = await this.runSearcher(plan);

      // Inject custom documents from vault if provided
      if (this.state.customDocuments && this.state.customDocuments.length > 0) {
        this.state.customDocuments.forEach((doc) => {
          sources.unshift({
            id: `src-custom-${doc.id}`,
            title: `[Internal Document] ${doc.name}`,
            url: '#custom-doc',
            domain: 'internal-vault.org',
            snippet: doc.content.substring(0, 300) + '...',
            publishDate: new Date(doc.uploadedAt).toISOString().split('T')[0],
            query: 'Custom Document Ingestion',
            relevanceScore: 99,
            authorOrOrg: 'User Uploaded File',
            isCustomUpload: true,
          });
        });
      }
      this.state.sources = sources;

      this.messageBus.publish(
        'searcher',
        'reader',
        'result',
        {
          sourcesDiscovered: sources.length,
          primaryDomains: Array.from(new Set(sources.map((s) => s.domain))).slice(0, 6),
        },
        `Discovered and deduplicated ${sources.length} primary source candidates across web probes.`
      );

      // -------------------------------------------------------------
      // STAGE 3: READER AGENT (First Extraction Pass)
      // -------------------------------------------------------------
      let facts = await this.runReader(plan, sources);
      this.state.facts = facts;
      this.memory.verifiedFacts = [...facts];

      this.messageBus.publish(
        'reader',
        'critic',
        'result',
        {
          extractedFactsCount: facts.length,
          statisticalMetricsCount: facts.filter((f) => f.category === 'statistic').length,
        },
        `Mined and structured ${facts.length} granular claims and empirical metrics from source text.`
      );

      // -------------------------------------------------------------
      // STAGE 4: CRITIC AGENT (Epistemic & Evidence Sufficiency Audit)
      // -------------------------------------------------------------
      let criticReview = await this.runCritic(plan, sources, facts);
      this.state.criticReview = criticReview;

      if (criticReview.informationGaps && criticReview.informationGaps.length > 0) {
        this.memory.knowledgeGaps = [...criticReview.informationGaps];
      }

      // Track rejected or flagged sources into memory
      criticReview.sourceScorecards?.forEach((sc) => {
        if (sc.credibilityScore < 60) {
          const matchedSrc = sources.find((s) => s.id === sc.sourceId);
          if (matchedSrc) {
            this.memory.rejectedSources.push({
              source: matchedSrc,
              reason: sc.verdict || 'Failed credibility audit threshold',
            });
          }
        }
      });

      // -------------------------------------------------------------
      // DYNAMIC ADAPTIVE LOOP 1: Critic -> Searcher/Reader Feedback Loop
      // If Critic identifies critical evidence gaps or requests follow-up
      // -------------------------------------------------------------
      const needsMoreEvidence =
        criticReview.criticDecision === 'request_more_evidence' ||
        ((criticReview.followUpSearchQueries?.length || 0) > 0 &&
          criticReview.overallCredibilityScore < 85);

      if (
        needsMoreEvidence &&
        criticReview.followUpSearchQueries &&
        criticReview.followUpSearchQueries.length > 0 &&
        (this.state.replanHistory?.length || 0) < 2
      ) {
        const gapReason =
          criticReview.informationGaps?.[0] || 'Unresolved hypothesis / evidence gaps detected by Critic';

        this.messageBus.publish(
          'critic',
          'searcher',
          'critique',
          {
            decision: 'request_more_evidence',
            gaps: criticReview.informationGaps,
            followUpQueries: criticReview.followUpSearchQueries,
            score: criticReview.overallCredibilityScore,
          },
          `Epistemic audit flagged knowledge gaps. Dispatched ${criticReview.followUpSearchQueries.length} targeted search vectors.`
        );

        const scoreBeforeReplan = criticReview.overallCredibilityScore;
        const queriesBefore = [...plan.searchQueries];
        const queriesAfter = [...criticReview.followUpSearchQueries];

        this.recordReplanLoop(
          'critic',
          'searcher',
          `Critic requested supplementary evidence: ${gapReason}`,
          `Dispatched ${criticReview.followUpSearchQueries.length} targeted search queries. Re-querying to resolve gaps.`,
          queriesBefore,
          queriesAfter,
          scoreBeforeReplan
        );

        // Planner refines hypotheses based on Critic's critique
        const refinedHypothesis = `Refined via Epistemic Critic: ${gapReason} necessitates targeted investigation of enterprise lifecycle amortisation and real-world TCO.`;
        if (!plan.hypotheses.includes(refinedHypothesis)) {
          plan.hypotheses.push(refinedHypothesis);
          this.memory.activeHypotheses = [...plan.hypotheses];
          this.messageBus.publish(
            'planner',
            'searcher',
            'task',
            { updatedHypotheses: plan.hypotheses, addedHypothesis: refinedHypothesis },
            'Planner updated active working hypotheses in shared memory in response to Critic gap critique.'
          );
        }

        // Trigger targeted search with different queries
        const additionalSources = await this.runTargetedSearcher(
          criticReview.followUpSearchQueries,
          plan.topic,
          sources
        );
        sources = [...sources, ...additionalSources];
        this.state.sources = sources;

        // Trigger Reader for additional evidence extraction
        this.recordReplanLoop(
          'searcher',
          'reader',
          'Reader processing newly retrieved supplementary sources',
          `Mined facts from ${additionalSources.length} newly discovered authority sources.`
        );
        const additionalFacts = await this.runReader(plan, additionalSources);
        facts = [...facts, ...additionalFacts];
        this.state.facts = facts;
        this.memory.verifiedFacts = [...facts];

        // Re-audit with updated evidence bank
        this.recordReplanLoop('reader', 'critic', 'Critic re-auditing consolidated evidence bank');
        criticReview = await this.runCritic(plan, sources, facts);
        // Mark scoreAfter on the replan loop
        if (this.state.replanHistory && this.state.replanHistory.length > 0) {
          const firstLoop = this.state.replanHistory[0];
          firstLoop.scoreAfter = criticReview.overallCredibilityScore;
        }
        this.state.criticReview = criticReview;
      }

      this.messageBus.publish(
        'critic',
        'writer',
        'task',
        {
          overallCredibilityScore: criticReview.overallCredibilityScore,
          verifiedClaimsCount: criticReview.verifiedClaims.length,
          guidance: criticReview.synthesisGuidanceForWriter,
        },
        'Evidence bank audited and approved. Authorizing executive report synthesis.'
      );

      // -------------------------------------------------------------
      // STAGE 5: WRITER AGENT (Draft Synthesis)
      // -------------------------------------------------------------
      let report = await this.runWriter(plan, sources, facts, criticReview);
      this.state.report = report;

      this.messageBus.publish(
        'writer',
        'critic',
        'result',
        {
          wordCount: report.wordCount,
          citationsCount: report.citations.length,
          readingTimeMinutes: report.readingTimeMinutes,
        },
        'Draft whitepaper compiled with footnote citation mappings. Submitted for post-draft audit.'
      );

      // -------------------------------------------------------------
      // DYNAMIC ADAPTIVE LOOP 2: Critic Post-Draft Audit & Revision Loop
      // Critic evaluates draft report for citation compliance & balance
      // -------------------------------------------------------------
      const draftAudit = await CriticAgent.auditDraftReport(
        plan,
        sources,
        facts,
        report.markdownContent,
        this.aiOptions,
        {
          onThought: (t) => {
            this.state.agents.critic.thoughtStream.push(t);
            this.emit({
              type: 'agent_thought',
              agent: 'critic',
              timestamp: Date.now(),
              data: { thought: t },
            });
          },
          onProgress: (p, task) => {
            this.updateAgent('critic', { progress: p, currentTask: task });
            this.emit({
              type: 'agent_progress',
              agent: 'critic',
              timestamp: Date.now(),
              data: { progress: p, task },
            });
          },
          onLog: (l) => {
            this.state.agents.critic.logs.push(l);
          },
        }
      );

      criticReview.draftAudit = draftAudit;
      this.state.criticReview = criticReview;

      if (!draftAudit.approved || draftAudit.score < 85) {
        this.messageBus.publish(
          'critic',
          'writer',
          'revision_request',
          {
            auditScore: draftAudit.score,
            issues: draftAudit.issues,
            directives: draftAudit.revisionDirectives,
          },
          'Post-draft audit detected citation or balance deficits. Demanded targeted revisions.'
        );

        this.recordReplanLoop(
          'critic',
          'writer',
          `Critic requested draft revisions (Score: ${draftAudit.score}/100)`,
          draftAudit.revisionDirectives.join(' | ')
        );

        // Run targeted revision pass
        report = await this.runWriterRevision(report, draftAudit, plan, sources, facts, criticReview);
        this.state.report = report;

        this.messageBus.publish(
          'writer',
          'critic',
          'result',
          {
            revisionsAppliedCount: report.revisionsApplied?.length || 1,
            finalWordCount: report.wordCount,
          },
          'Directives integrated and revised whitepaper signed off for publication.'
        );
      }

      // -------------------------------------------------------------
      // WORKFLOW COMPLETE: Generate Full Execution Trace
      // -------------------------------------------------------------
      this.state.status = 'completed';
      this.state.activeAgent = null;
      this.state.completedAt = Date.now();

      const totalDuration = this.state.completedAt - (this.state.startedAt || this.state.completedAt);

      const executionTrace: ExecutionTrace = {
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp: this.state.startedAt || Date.now(),
        topic: this.state.topic,
        depth: this.state.depth,
        persona: this.state.persona,
        totalDurationMs: totalDuration,
        agentsExecuted: ['planner', 'searcher', 'reader', 'critic', 'writer'],
        messages: this.messageBus.getMessages(),
        toolCalls: this.state.toolCalls,
        replanLoops: this.state.replanHistory || [],
        sharedMemorySnapshot: this.memory,
        finalReportSummary: {
          title: report.title,
          wordCount: report.wordCount,
          citationCount: report.citations.length,
          epistemicScore: criticReview.overallCredibilityScore,
        },
      };

      this.state.trace = executionTrace;

      this.emit({
        type: 'workflow_complete',
        timestamp: Date.now(),
        data: {
          report,
          trace: executionTrace,
          state: this.state,
        },
      });

      return this.state;
    } catch (err: any) {
      this.state.status = 'error';
      this.state.error = err?.message || String(err);

      this.emit({
        type: 'workflow_error',
        timestamp: Date.now(),
        data: { error: this.state.error },
      });

      throw err;
    }
  }

  private async runPlanner(): Promise<ResearchPlan> {
    const agentId: AgentType = 'planner';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: `Designing ${this.state.persona.toUpperCase()} research architecture`,
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    const plan = await PlannerAgent.execute(
      this.state.topic,
      this.state.depth,
      `${this.state.customInstructions || ''} [Target Persona: ${this.state.persona}]`,
      this.aiOptions,
      {
        onThought: (thought) => {
          this.state.agents[agentId].thoughtStream.push(thought);
          this.emit({
            type: 'agent_thought',
            agent: agentId,
            timestamp: Date.now(),
            data: { thought },
          });
        },
        onProgress: (progress, task) => {
          this.updateAgent(agentId, { progress, currentTask: task });
          this.emit({
            type: 'agent_progress',
            agent: agentId,
            timestamp: Date.now(),
            data: { progress, task },
          });
        },
        onLog: (log) => {
          this.state.agents[agentId].logs.push(log);
        },
      }
    );

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: 'Research blueprint established',
    });

    this.emit({
      type: 'agent_artifact',
      agent: agentId,
      timestamp: endTime,
      data: { plan },
    });

    this.emit({
      type: 'agent_complete',
      agent: agentId,
      timestamp: endTime,
      data: { agent: this.state.agents[agentId] },
    });

    return plan;
  }

  private async runSearcher(plan: ResearchPlan): Promise<SearchSource[]> {
    const agentId: AgentType = 'searcher';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: 'Launching web probes across target query vectors',
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    // Execute tool calls through WebSearchTool
    for (const q of plan.searchQueries) {
      const toolStart = Date.now();
      const toolRes = await WebSearchTool.execute({ query: q, scope: this.state.searchScope });
      this.recordToolCall(
        'searcher',
        WebSearchTool.toolName,
        { query: q },
        { resultsCount: toolRes.totalResults },
        Date.now() - toolStart,
        true
      );
    }

    const sources = await SearcherAgent.execute(plan, this.aiOptions, {
      onThought: (thought) => {
        this.state.agents[agentId].thoughtStream.push(thought);
        this.emit({
          type: 'agent_thought',
          agent: agentId,
          timestamp: Date.now(),
          data: { thought },
        });
      },
      onProgress: (progress, task) => {
        this.updateAgent(agentId, { progress, currentTask: task });
        this.emit({
          type: 'agent_progress',
          agent: agentId,
          timestamp: Date.now(),
          data: { progress, task },
        });
      },
      onLog: (log) => {
        this.state.agents[agentId].logs.push(log);
      },
    });

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: `Discovered ${sources.length} sources`,
    });

    this.emit({
      type: 'agent_artifact',
      agent: agentId,
      timestamp: endTime,
      data: { sources },
    });

    this.emit({
      type: 'agent_complete',
      agent: agentId,
      timestamp: endTime,
      data: { agent: this.state.agents[agentId] },
    });

    return sources;
  }

  private async runTargetedSearcher(
    queries: string[],
    topic: string,
    existingSources: SearchSource[]
  ): Promise<SearchSource[]> {
    const agentId: AgentType = 'searcher';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: `Executing ${queries.length} follow-up queries directed by Critic`,
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    for (const q of queries) {
      const toolStart = Date.now();
      const toolRes = await WebSearchTool.execute({ query: q });
      this.recordToolCall(
        'searcher',
        WebSearchTool.toolName,
        { query: q, reason: 'Critic Replan Vector' },
        { resultsCount: toolRes.totalResults },
        Date.now() - toolStart,
        true
      );
    }

    const sources = await SearcherAgent.executeTargeted(
      queries,
      topic,
      existingSources,
      this.state.depth,
      {
        onThought: (thought) => {
          this.state.agents[agentId].thoughtStream.push(thought);
          this.emit({
            type: 'agent_thought',
            agent: agentId,
            timestamp: Date.now(),
            data: { thought },
          });
        },
        onProgress: (progress, task) => {
          this.updateAgent(agentId, { progress, currentTask: task });
          this.emit({
            type: 'agent_progress',
            agent: agentId,
            timestamp: Date.now(),
            data: { progress, task },
          });
        },
        onLog: (log) => {
          this.state.agents[agentId].logs.push(log);
        },
      }
    );

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: `Added ${sources.length} supplementary sources`,
    });

    return sources;
  }

  private async runReader(plan: ResearchPlan, sources: SearchSource[]): Promise<ExtractedFact[]> {
    const agentId: AgentType = 'reader';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: `Analyzing ${sources.length} documents for quantitative evidence`,
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    // Invoke DocumentParserTool on candidate batches
    sources.slice(0, 4).forEach((s) => {
      const parserStart = Date.now();
      const parseRes = DocumentParserTool.execute({
        documentId: s.id,
        title: s.title,
        content: s.snippet,
        sourceType: s.isCustomUpload ? 'custom_upload' : 'web_snippet',
      });
      this.recordToolCall(
        'reader',
        DocumentParserTool.toolName,
        { documentId: s.id, title: s.title },
        parseRes,
        Date.now() - parserStart,
        true
      );
    });

    const facts = await ReaderAgent.execute(plan, sources, this.aiOptions, {
      onThought: (thought) => {
        this.state.agents[agentId].thoughtStream.push(thought);
        this.emit({
          type: 'agent_thought',
          agent: agentId,
          timestamp: Date.now(),
          data: { thought },
        });
      },
      onProgress: (progress, task) => {
        this.updateAgent(agentId, { progress, currentTask: task });
        this.emit({
          type: 'agent_progress',
          agent: agentId,
          timestamp: Date.now(),
          data: { progress, task },
        });
      },
      onLog: (log) => {
        this.state.agents[agentId].logs.push(log);
      },
    });

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: `Extracted ${facts.length} verified facts`,
    });

    this.emit({
      type: 'agent_artifact',
      agent: agentId,
      timestamp: endTime,
      data: { facts },
    });

    this.emit({
      type: 'agent_complete',
      agent: agentId,
      timestamp: endTime,
      data: { agent: this.state.agents[agentId] },
    });

    return facts;
  }

  private async runCritic(
    plan: ResearchPlan,
    sources: SearchSource[],
    facts: ExtractedFact[]
  ): Promise<CriticReview> {
    const agentId: AgentType = 'critic';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: this.state.redTeamMode
        ? 'Executing Adversarial Red Team stress tests'
        : 'Auditing source authority and detecting biases',
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    // Invoke ScoringRubricTool for each source
    sources.slice(0, 5).forEach((s) => {
      const toolStart = Date.now();
      const rubricRes = ScoringRubricTool.evaluateSource({ source: s, facts });
      this.recordToolCall(
        'critic',
        ScoringRubricTool.toolName,
        { sourceId: s.id, domain: s.domain },
        rubricRes,
        Date.now() - toolStart,
        true
      );
    });

    const review = await CriticAgent.execute(
      plan,
      sources,
      facts,
      this.state.redTeamMode,
      this.aiOptions,
      {
        onThought: (thought) => {
          this.state.agents[agentId].thoughtStream.push(thought);
          this.emit({
            type: 'agent_thought',
            agent: agentId,
            timestamp: Date.now(),
            data: { thought },
          });
        },
        onProgress: (progress, task) => {
          this.updateAgent(agentId, { progress, currentTask: task });
          this.emit({
            type: 'agent_progress',
            agent: agentId,
            timestamp: Date.now(),
            data: { progress, task },
          });
        },
        onLog: (log) => {
          this.state.agents[agentId].logs.push(log);
        },
      }
    );

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: `Scorecard: ${review.overallCredibilityScore}/100`,
    });

    this.emit({
      type: 'agent_artifact',
      agent: agentId,
      timestamp: endTime,
      data: { criticReview: review },
    });

    this.emit({
      type: 'agent_complete',
      agent: agentId,
      timestamp: endTime,
      data: { agent: this.state.agents[agentId] },
    });

    return review;
  }

  private async runWriter(
    plan: ResearchPlan,
    sources: SearchSource[],
    facts: ExtractedFact[],
    criticReview: CriticReview
  ): Promise<FinalReport> {
    const agentId: AgentType = 'writer';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 0,
      startedAt: startTime,
      currentTask: `Drafting ${this.state.persona.toUpperCase()} report & audio briefing`,
    });

    this.emit({
      type: 'agent_start',
      agent: agentId,
      timestamp: startTime,
      data: { agent: this.state.agents[agentId] },
    });

    const report = await WriterAgent.execute(
      plan,
      sources,
      facts,
      criticReview,
      this.state.persona,
      this.aiOptions,
      {
        onThought: (thought) => {
          this.state.agents[agentId].thoughtStream.push(thought);
          this.emit({
            type: 'agent_thought',
            agent: agentId,
            timestamp: Date.now(),
            data: { thought },
          });
        },
        onProgress: (progress, task) => {
          this.updateAgent(agentId, { progress, currentTask: task });
          this.emit({
            type: 'agent_progress',
            agent: agentId,
            timestamp: Date.now(),
            data: { progress, task },
          });
        },
        onLog: (log) => {
          this.state.agents[agentId].logs.push(log);
        },
        onChunk: (chunk) => {
          this.emit({
            type: 'report_chunk',
            agent: agentId,
            timestamp: Date.now(),
            data: { chunk },
          });
        },
      }
    );

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: `Completed ${report.wordCount} words whitepaper`,
    });

    this.emit({
      type: 'agent_artifact',
      agent: agentId,
      timestamp: endTime,
      data: { report },
    });

    this.emit({
      type: 'agent_complete',
      agent: agentId,
      timestamp: endTime,
      data: { agent: this.state.agents[agentId] },
    });

    return report;
  }

  private async runWriterRevision(
    report: FinalReport,
    audit: any,
    plan: ResearchPlan,
    sources: SearchSource[],
    facts: ExtractedFact[],
    criticReview: CriticReview
  ): Promise<FinalReport> {
    const agentId: AgentType = 'writer';
    this.state.activeAgent = agentId;
    const startTime = Date.now();

    this.updateAgent(agentId, {
      status: 'running',
      progress: 30,
      startedAt: startTime,
      currentTask: 'Applying Critic revision directives',
    });

    const revisedReport = await WriterAgent.reviseReport(
      report,
      audit,
      plan,
      sources,
      facts,
      criticReview,
      this.aiOptions,
      {
        onThought: (thought) => {
          this.state.agents[agentId].thoughtStream.push(thought);
          this.emit({
            type: 'agent_thought',
            agent: agentId,
            timestamp: Date.now(),
            data: { thought },
          });
        },
        onProgress: (progress, task) => {
          this.updateAgent(agentId, { progress, currentTask: task });
          this.emit({
            type: 'agent_progress',
            agent: agentId,
            timestamp: Date.now(),
            data: { progress, task },
          });
        },
        onLog: (log) => {
          this.state.agents[agentId].logs.push(log);
        },
      }
    );

    const endTime = Date.now();
    this.updateAgent(agentId, {
      status: 'completed',
      progress: 100,
      completedAt: endTime,
      durationMs: endTime - startTime,
      currentTask: 'Critic revisions incorporated into final whitepaper',
    });

    return revisedReport;
  }
}

// Max replan loop limit constant for multi-agent reasoning verification
export const MAX_REPLAN_CYCLES = 3;
