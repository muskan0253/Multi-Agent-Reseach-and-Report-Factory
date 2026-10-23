import { ResearchPlan, ResearchDepth } from '../types';
import { AIService, GenerateOptions } from './aiService';

export interface PlannerCallbacks {
  onThought: (thought: string) => void;
  onProgress: (progress: number, task: string) => void;
  onLog: (log: string) => void;
}

export class PlannerAgent {
  public static async execute(
    topic: string,
    depth: ResearchDepth,
    customInstructions?: string,
    aiOptions: GenerateOptions = {},
    callbacks?: PlannerCallbacks
  ): Promise<ResearchPlan> {
    callbacks?.onLog(`[Planner] Initiating research strategic mapping for: "${topic}" (Depth: ${depth})`);
    callbacks?.onThought(`Deconstructing core problem domain, target audience requirements, and key analytical angles...`);
    callbacks?.onProgress(15, 'Analyzing topic scope and domain ontology');

    const prompt = `
You are the **Lead Strategic Research Planner Agent** in an elite autonomous intelligence factory.
Your mission is to formulate an exhaustive, multi-faceted research architecture for the topic:
Topic: "${topic}"
Depth: ${depth}
${customInstructions ? `Custom User Directives: ${customInstructions}` : ''}

Generate a comprehensive JSON response matching this exact schema:
{
  "topic": "${topic}",
  "targetAudience": "e.g. Executive Decision Makers, AI Engineers, Policy Analysts, Investors",
  "coreObjectives": [
    "string: objective 1",
    "string: objective 2",
    "string: objective 3"
  ],
  "subQuestions": [
    "string: specific research question 1",
    "string: specific research question 2",
    "string: specific research question 3",
    "string: specific research question 4"
  ],
  "hypotheses": [
    "string: testable hypothesis 1",
    "string: testable hypothesis 2"
  ],
  "searchQueries": [
    "string: boolean / keyword search query 1",
    "string: boolean / keyword search query 2",
    "string: boolean / keyword search query 3",
    "string: boolean / keyword search query 4"
  ],
  "proposedSections": [
    { "title": "Executive Summary", "focus": "High-level takeaways and strategic thesis" },
    { "title": "Section Title 1", "focus": "Detailed focus area" },
    { "title": "Section Title 2", "focus": "Detailed focus area" },
    { "title": "Critical Risk & Counter-Perspectives", "focus": "Evaluating trade-offs, bottlenecks, and alternative viewpoints" },
    { "title": "Strategic Outlook & Recommendations", "focus": "Actionable roadmap and horizon forecast" }
  ]
}

Return ONLY valid JSON.
`;

    callbacks?.onThought(`Formulating targeted search query vectors and section blueprint...`);
    callbacks?.onProgress(50, 'Synthesizing hypotheses and search vectors');

    const rawResponse = await AIService.generateText(prompt, {
      ...aiOptions,
      systemInstruction: 'You are an elite Research Strategy Planner. Produce strictly structured JSON plans.',
    });

    let plan: ResearchPlan | null = null;
    if (rawResponse) {
      plan = AIService.parseJSONFromResponse<ResearchPlan | null>(rawResponse, null);
    }

    if (!plan || !plan.searchQueries || plan.searchQueries.length === 0) {
      // Robust domain heuristic fallback
      callbacks?.onThought(`Generating structured domain plan via internal reasoning heuristics...`);
      plan = this.generateFallbackPlan(topic, depth, customInstructions);
    }

    plan.depth = depth;

    callbacks?.onThought(`Research blueprint finalized with ${plan.subQuestions.length} core lines of inquiry and ${plan.searchQueries.length} search queries.`);
    callbacks?.onLog(`[Planner] Strategy approved: ${plan.proposedSections.length} sections outlined, ${plan.searchQueries.length} targeted search queries dispatched to Searcher Agent.`);
    callbacks?.onProgress(100, 'Research strategy mapped');

    return plan;
  }

  private static generateFallbackPlan(
    topic: string,
    depth: ResearchDepth,
    customInstructions?: string
  ): ResearchPlan {
    const isDeep = depth === 'deep';
    const isQuick = depth === 'quick';

    const queries = [
      `${topic} market overview trends and technological breakthroughs 2024 2025`,
      `${topic} key challenges architecture limitations and risks`,
      `${topic} quantitative benchmarks comparative performance statistics`,
      `${topic} expert case studies adoption roadmaps and future outlook`,
    ];

    if (isDeep) {
      queries.push(`${topic} counter-arguments criticisms regulatory headwinds`);
      queries.push(`${topic} economic cost benefit ROI analysis`);
    }

    return {
      topic,
      targetAudience: 'Technology Executives, Investors, and Strategic Domain Specialists',
      coreObjectives: [
        `Deliver a comprehensive, evidence-grounded assessment of "${topic}"`,
        'Identify key technological architectures, commercial milestones, and market dynamics',
        'Audit underlying risk factors, bottlenecks, and counter-perspectives',
        'Formulate actionable horizon recommendations for stakeholders'
      ],
      subQuestions: [
        `What are the foundational mechanisms and state-of-the-art advances in ${topic}?`,
        `What empirical data and quantitative metrics validate current progress and industry claims?`,
        `What are the principal headwinds, edge cases, security, and scalability bottlenecks?`,
        `How does ${topic} compare against alternative paradigms and legacy approaches?`,
        `What will the trajectory of ${topic} look like over the next 3 to 5 years?`
      ],
      hypotheses: [
        `Hypothesis A: Accelerating adoption of ${topic} will yield compounding productivity and efficiency dividends, despite current infrastructure constraints.`,
        `Hypothesis B: Widespread scaling will require addressing critical standardizations, supply-chain/reliability hurdles, and cost parity.`
      ],
      searchQueries: isQuick ? queries.slice(0, 3) : queries,
      proposedSections: [
        { title: '1. Executive Summary & Core Thesis', focus: 'High-level synthesis, key findings, and strategic impact.' },
        { title: '2. Technological Architecture & State-of-the-Art', focus: 'Fundamental mechanics, recent breakthroughs, and operational paradigms.' },
        { title: '3. Quantitative Benchmarks & Market Performance', focus: 'Empirical data, cost-efficiency comparisons, and adoption metrics.' },
        { title: '4. Critical Risks, Vulnerabilities & Counter-Arguments', focus: 'Unresolved challenges, scalability limits, and skeptical viewpoints.' },
        { title: '5. Strategic Roadmap & Future Outlook', focus: 'Actionable recommendations, 3-5 year horizon projections, and key milestones.' }
      ],
      depth,
    };
  }
}

// Dynamic search vector expansion multiplier for replanning cycles
export const REPLAN_QUERY_EXPANSION_RATE = 1.5;
