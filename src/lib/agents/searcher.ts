import { ResearchPlan, SearchSource } from '../types';
import { SearchService } from '../search/searchService';
import { GenerateOptions } from './aiService';

export interface SearcherCallbacks {
  onThought: (thought: string) => void;
  onProgress: (progress: number, task: string) => void;
  onLog: (log: string) => void;
  onSourceFound?: (source: SearchSource) => void;
}

export class SearcherAgent {
  public static async execute(
    plan: ResearchPlan,
    aiOptions: GenerateOptions = {},
    callbacks?: SearcherCallbacks
  ): Promise<SearchSource[]> {
    callbacks?.onLog(`[Searcher] Received ${plan.searchQueries.length} target search vectors from Planner.`);
    callbacks?.onThought(`Initializing web search probes and academic indexing across primary sources...`);
    callbacks?.onProgress(10, 'Initializing search probes');

    return this.executeQueries(plan.searchQueries, plan.topic, plan.depth, callbacks);
  }

  /**
   * Executes a targeted set of follow-up search queries dispatched by the Critic or Planner replanning loops.
   */
  public static async executeTargeted(
    queries: string[],
    topic: string,
    existingSources: SearchSource[] = [],
    depth: 'quick' | 'standard' | 'deep' = 'standard',
    callbacks?: SearcherCallbacks
  ): Promise<SearchSource[]> {
    callbacks?.onLog(`[Searcher] Received ${queries.length} targeted follow-up query vectors from Critic replanning loop.`);
    callbacks?.onThought(`Dispatching targeted follow-up probes to resolve identified evidence gaps...`);
    callbacks?.onProgress(15, 'Launching targeted evidence probes');

    const seenUrls = new Set<string>(existingSources.map(s => s.url));
    const newSources = await this.executeQueries(queries, topic, depth, callbacks, seenUrls);
    return newSources;
  }

  private static async executeQueries(
    queries: string[],
    topic: string,
    depth: 'quick' | 'standard' | 'deep',
    callbacks?: SearcherCallbacks,
    seenUrls: Set<string> = new Set()
  ): Promise<SearchSource[]> {
    const allSources: SearchSource[] = [];
    const maxPerQuery = depth === 'deep' ? 4 : depth === 'quick' ? 2 : 3;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const progressPercent = 10 + Math.round(((i + 1) / queries.length) * 75);
      
      callbacks?.onThought(`Dispatching probe query [${i + 1}/${queries.length}]: "${query}"`);
      callbacks?.onProgress(progressPercent, `Searching: "${query.substring(0, 35)}..."`);

      try {
        const results = await SearchService.executeSearch(query, topic, maxPerQuery);
        
        for (const res of results) {
          if (!seenUrls.has(res.url)) {
            seenUrls.add(res.url);
            allSources.push(res);
            callbacks?.onSourceFound?.(res);
            callbacks?.onLog(`[Searcher] Discovered source: [${res.domain}] "${res.title.substring(0, 50)}..."`);
          }
        }
      } catch (err: any) {
        callbacks?.onLog(`[Searcher] Warning: Search query error on "${query}": ${err?.message || err}`);
      }
    }

    callbacks?.onThought(`Consolidated ${allSources.length} unique reference sources across ${new Set(allSources.map(s => s.domain)).size} distinct domains.`);
    callbacks?.onProgress(100, `Found ${allSources.length} sources`);
    callbacks?.onLog(`[Searcher] Query pass complete: ${allSources.length} new sources retrieved.`);

    return allSources;
  }
}

// Telemetry hook for dynamic search query rate-limiting and domain diversity
export const SEARCHER_DIVERSITY_FACTOR = 0.85;
