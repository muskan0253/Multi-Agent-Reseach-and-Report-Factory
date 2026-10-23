export type AgentType = 'planner' | 'searcher' | 'reader' | 'critic' | 'writer';

export type AgentStatus = 'idle' | 'waiting' | 'running' | 'completed' | 'error';

export type ResearchDepth = 'quick' | 'standard' | 'deep';

export type ReportPersona = 'executive' | 'academic' | 'investment' | 'technical';

export type SearchScope = 'all' | 'academic' | 'financial' | 'medical';

export interface AgentInfo {
  id: AgentType;
  name: string;
  role: string;
  avatar: string;
  color: string;
  description: string;
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  thoughtStream: string[];
  logs: string[];
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  tokensProcessed?: number;
}

export interface ResearchPlan {
  topic: string;
  targetAudience: string;
  coreObjectives: string[];
  subQuestions: string[];
  hypotheses: string[];
  searchQueries: string[];
  proposedSections: {
    title: string;
    focus: string;
  }[];
  depth: ResearchDepth;
  persona?: ReportPersona;
}

export interface SearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishDate?: string;
  query: string;
  relevanceScore?: number;
  authorOrOrg?: string;
  enabled?: boolean;
  isCustomUpload?: boolean;
}

export interface ExtractedFact {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  fact: string;
  quote?: string;
  category: 'statistic' | 'finding' | 'historical_event' | 'expert_opinion' | 'counter_argument' | 'projection';
  confidence: number;
  timeframe?: string;
  numericValue?: number;
  numericLabel?: string;
}

export interface SourceScorecard {
  sourceId: string;
  domain: string;
  credibilityScore: number;
  authorityLevel: 'High' | 'Medium' | 'Low' | 'Caution';
  biasRating: 'Minimal' | 'Moderate' | 'High' | 'Commercial' | 'Academic';
  flags: string[];
  verdict: string;
}

export interface RedTeamAudit {
  vulnerabilitiesIdentified: string[];
  counterTheses: string[];
  worstCaseScenarios: string[];
  blindspotsFlagged: string[];
}

export interface DraftReportAudit {
  score: number;
  approved: boolean;
  uncitedClaimsCount: number;
  issues: string[];
  revisionDirectives: string[];
  verifiedCitationRatio: number;
}

export interface CriticReview {
  overallCredibilityScore: number;
  totalSourcesEvaluated: number;
  verifiedFactsCount: number;
  flaggedClaimsCount: number;
  sourceScorecards: SourceScorecard[];
  verifiedClaims: {
    claim: string;
    supportingSourceIds: string[];
    strength: 'Robust' | 'Moderate' | 'Preliminary';
  }[];
  questionableClaims: {
    claim: string;
    issue: string;
    risk: 'High' | 'Medium' | 'Low';
    recommendation: string;
  }[];
  informationGaps?: string[];
  followUpSearchQueries?: string[];
  criticDecision?: 'approved' | 'request_more_evidence' | 'request_draft_revision';
  draftAudit?: DraftReportAudit;
  methodologyNotes: string[];
  synthesisGuidanceForWriter: string[];
  redTeamAudit?: RedTeamAudit;
}

export interface CitationItem {
  id: string;
  index: number;
  title: string;
  url: string;
  domain: string;
  authorOrOrg?: string;
  accessedDate: string;
  credibilityScore?: number;
}

export interface PodcastDialogueItem {
  speaker: 'Alex (Host)' | 'Dr. Taylor (Lead Analyst)';
  avatar: string;
  text: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  takeaway: string;
  chartSuggestion?: string;
}

export interface FinalReport {
  id: string;
  topic: string;
  title: string;
  subtitle: string;
  executiveSummary: string;
  markdownContent: string;
  wordCount: number;
  readingTimeMinutes: number;
  citations: CitationItem[];
  generatedAt: string;
  plan: ResearchPlan;
  criticReview: CriticReview;
  podcastDialogue?: PodcastDialogueItem[];
  slides?: SlideItem[];
  revisionsApplied?: string[];
}

export interface CustomDocument {
  id: string;
  name: string;
  size: number;
  content: string;
  uploadedAt: string;
}

export interface SavedResearchItem {
  id: string;
  topic: string;
  depth: ResearchDepth;
  persona: ReportPersona;
  savedAt: string;
  report: FinalReport;
  sourcesCount: number;
  factsCount: number;
  credibilityScore: number;
}

export interface ReplanLoopRecord {
  loopNumber: number;
  from: AgentType;
  to: AgentType;
  reason: string;
  timestamp: number;
  details?: string;
  queryBefore?: string[];
  queryAfter?: string[];
  scoreBefore?: number;
  scoreAfter?: number;
}

// -------------------------------------------------------------
// Typed Inter-Agent Message Bus & Shared Memory Interfaces (Part 2)
// -------------------------------------------------------------

export type AgentMessageType = 'task' | 'result' | 'critique' | 'revision_request' | 'escalation';

export interface AgentMessage {
  id: string;
  timestamp: number;
  from: AgentType;
  to: AgentType | 'broadcast';
  type: AgentMessageType;
  payload: any;
  reasoning: string;
}

export interface ToolCallRecord {
  id: string;
  agent: AgentType;
  toolName: string;
  timestamp: number;
  input: any;
  output: any;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface SharedRunMemory {
  verifiedFacts: ExtractedFact[];
  rejectedSources: { source: SearchSource; reason: string }[];
  openQuestions: string[];
  activeHypotheses: string[];
  knowledgeGaps: string[];
  replanCount: number;
}

export interface ExecutionTrace {
  traceId: string;
  timestamp: number;
  topic: string;
  depth: ResearchDepth;
  persona: ReportPersona;
  totalDurationMs: number;
  agentsExecuted: AgentType[];
  messages: AgentMessage[];
  toolCalls: ToolCallRecord[];
  replanLoops: ReplanLoopRecord[];
  sharedMemorySnapshot: SharedRunMemory;
  finalReportSummary?: {
    title: string;
    wordCount: number;
    citationCount: number;
    epistemicScore: number;
  };
}

export interface ResearchWorkflowState {
  topic: string;
  depth: ResearchDepth;
  persona: ReportPersona;
  searchScope: SearchScope;
  redTeamMode: boolean;
  customInstructions?: string;
  customDocuments: CustomDocument[];
  status: 'idle' | 'running' | 'completed' | 'error';
  activeAgent: AgentType | null;
  agents: Record<AgentType, AgentInfo>;
  plan?: ResearchPlan;
  sources: SearchSource[];
  facts: ExtractedFact[];
  criticReview?: CriticReview;
  report?: FinalReport;
  streamingReportChunk?: string;
  totalTokens: number;
  iterationCount?: number;
  replanHistory?: ReplanLoopRecord[];
  messages: AgentMessage[];
  toolCalls: ToolCallRecord[];
  trace?: ExecutionTrace;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export type StreamEventType =
  | 'workflow_start'
  | 'agent_start'
  | 'agent_thought'
  | 'agent_progress'
  | 'agent_artifact'
  | 'agent_complete'
  | 'agent_replan_loop'
  | 'agent_message'
  | 'agent_tool_call'
  | 'report_chunk'
  | 'workflow_complete'
  | 'workflow_error';

export interface StreamEvent {
  type: StreamEventType;
  agent?: AgentType;
  timestamp: number;
  data: any;
}

export interface DynamicReplanningFeedback {
  iteration: number;
  targetStage: 'Planner' | 'Searcher' | 'Reader';
  shortfalls: string[];
  recommendedActions: string[];
  gapAnalysisConfidence: number;
}

export interface StageLatencyMetrics {
  plannerMs: number;
  searcherMs: number;
  readerMs: number;
  criticMs: number;
  writerMs: number;
}
