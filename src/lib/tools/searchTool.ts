import { SearchSource, SearchScope } from '../types';
import { SearchService } from '../search/searchService';

export interface SearchToolInput {
  query: string;
  scope?: SearchScope;
  maxResults?: number;
}

export interface SearchToolResult {
  query: string;
  sources: SearchSource[];
  totalResults: number;
  durationMs: number;
}

export class WebSearchTool {
  public static readonly toolName = 'web_search_probe';
  public static readonly description = 'Searches web and academic engines for authoritative primary sources and technical documents.';

  public static async execute(input: SearchToolInput): Promise<SearchToolResult> {
    const startTime = Date.now();
    const maxResults = input.maxResults || 3;

    try {
      const sources = await SearchService.executeSearch(input.query, input.query, maxResults);
      return {
        query: input.query,
        sources,
        totalResults: sources.length,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      console.warn(`[WebSearchTool] Search probe failed for "${input.query}":`, err?.message);
      return {
        query: input.query,
        sources: [],
        totalResults: 0,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

// Cache TTL for simulated web search probe results
export const SEARCH_CACHE_TTL_MS = 60000;
