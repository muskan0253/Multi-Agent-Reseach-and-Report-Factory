import { SearchSource, ExtractedFact, SourceScorecard } from '../types';

export interface RubricEvaluationInput {
  source: SearchSource;
  facts: ExtractedFact[];
}

export interface RubricEvaluationResult {
  scorecard: SourceScorecard;
  credibilityScore: number;
  relevanceScore: number;
  recencyScore: number;
  biasPenalty: number;
  passedThreshold: boolean;
}

export class ScoringRubricTool {
  public static readonly toolName = 'epistemic_scoring_rubric';
  public static readonly description = 'Multi-factor evaluation auditing domain authority, methodological rigor, publication recency, and corporate bias.';

  public static evaluateSource(input: RubricEvaluationInput): RubricEvaluationResult {
    const { source, facts } = input;
    const domain = (source.domain || '').toLowerCase();

    // 1. Domain Authority Score (0 - 45 points)
    let domainScore = 28;
    let authorityLevel: 'High' | 'Medium' | 'Low' | 'Caution' = 'Medium';
    let biasRating: 'Minimal' | 'Moderate' | 'High' | 'Commercial' | 'Academic' = 'Moderate';
    const flags: string[] = [];

    if (/\.(edu|gov|org|ac\.uk)$/i.test(domain) || /(nature\.com|ieee\.org|sciencedirect|arxiv|nih\.gov)/i.test(domain)) {
      domainScore = 45;
      authorityLevel = 'High';
      biasRating = 'Academic';
    } else if (/(bloomberg\.com|reuters\.com|wsj\.com|ft\.com|forbes\.com)/i.test(domain)) {
      domainScore = 38;
      authorityLevel = 'High';
      biasRating = 'Minimal';
    } else if (/(techcrunch|wired|theverge|arstechnica)/i.test(domain)) {
      domainScore = 32;
      authorityLevel = 'Medium';
      biasRating = 'Moderate';
    } else if (/(medium\.com|blogspot|wordpress|substack)/i.test(domain)) {
      domainScore = 15;
      authorityLevel = 'Low';
      biasRating = 'High';
      flags.push('Self-published or unpeer-reviewed domain');
    }

    // 2. Fact Grounding & Numerical Density Score (0 - 35 points)
    const associatedFacts = facts.filter(f => f.sourceId === source.id);
    const hasStatistics = associatedFacts.some(f => f.category === 'statistic');
    const factScore = Math.min(35, (associatedFacts.length * 10) + (hasStatistics ? 10 : 0));

    // 3. Recency Score (0 - 20 points)
    let recencyScore = 15;
    if (source.publishDate) {
      const year = parseInt(source.publishDate.substring(0, 4), 10);
      if (year >= 2024) recencyScore = 20;
      else if (year >= 2022) recencyScore = 16;
      else if (year >= 2020) recencyScore = 12;
      else {
        recencyScore = 8;
        flags.push(`Older publication date: ${source.publishDate}`);
      }
    }

    // 4. Commercial Bias Assessment (0 - 15 penalty)
    let biasPenalty = 0;
    if (/\b(sponsor|partner|affiliate|press-release|pr-newswire)\b/i.test(source.snippet + ' ' + source.url)) {
      biasPenalty = 15;
      biasRating = 'Commercial';
      flags.push('Potential commercial or PR bias detected in snippet');
    }

    const totalScore = Math.max(25, Math.min(99, domainScore + factScore + recencyScore - biasPenalty));
    const passed = totalScore >= 70;

    return {
      scorecard: {
        sourceId: source.id,
        domain: source.domain,
        credibilityScore: totalScore,
        authorityLevel,
        biasRating,
        flags,
        verdict: passed
          ? `Verified reference passed rigor audit (${totalScore}/100)`
          : `Flagged: source fails minimum epistemic threshold (${totalScore}/100)`,
      },
      credibilityScore: totalScore,
      relevanceScore: Math.min(98, 70 + associatedFacts.length * 5),
      recencyScore,
      biasPenalty,
      passedThreshold: passed,
    };
  }
}

// Academic source credibility weight multiplier
export const PEER_REVIEW_BOOST_MULTIPLIER = 1.15;
