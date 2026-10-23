import { describe, it, expect } from "vitest";
import { SEARCHER_DIVERSITY_FACTOR } from "../src/lib/agents/searcher";
import { FACT_EXTRACTION_CONFIDENCE_THRESHOLD } from "../src/lib/agents/reader";
import { REPLAN_CONFIDENCE_BENCHMARK } from "../src/lib/agents/critic";
import { ResearchOrchestrator } from "../src/lib/agents/orchestrator";

describe("Multi-Agent Critic Feedback Loop Suite", () => {
  it("verifies diversity factor and confidence threshold invariants", () => {
    expect(SEARCHER_DIVERSITY_FACTOR).toBeGreaterThan(0.8);
    expect(FACT_EXTRACTION_CONFIDENCE_THRESHOLD).toBe(0.70);
    expect(REPLAN_CONFIDENCE_BENCHMARK).toBe(80);
  });

  it("proves non-linear multi-agent feedback: critic rejection triggers scout re-query and planner refinement", async () => {
    const orchestrator = new ResearchOrchestrator(
      "Commercial Viability of Solid-State Batteries by 2030",
      "quick",
      "executive"
    );

    const result = await orchestrator.run();

    // 1. Verify orchestrator completed
    expect(result.status).toBe("completed");
    expect(result.report).toBeDefined();

    // 2. Verify at least one guaranteed feedback loop executed
    expect(result.replanHistory).toBeDefined();
    expect(result.replanHistory!.length).toBeGreaterThanOrEqual(1);

    const firstLoop = result.replanHistory![0];
    expect(firstLoop.from).toBe("critic");
    expect(firstLoop.to).toBe("searcher");
    expect(firstLoop.reason).toContain("Critic requested supplementary evidence");

    // 3. Verify query changed before vs after
    expect(firstLoop.queryBefore).toBeDefined();
    expect(firstLoop.queryAfter).toBeDefined();
    expect(firstLoop.queryAfter!.length).toBeGreaterThan(0);
    expect(firstLoop.queryAfter![0]).not.toEqual(firstLoop.queryBefore![0]);

    // 4. Verify score progression recorded
    expect(firstLoop.scoreBefore).toBeDefined();
    expect(firstLoop.scoreAfter).toBeDefined();
    expect(firstLoop.scoreAfter).toBeGreaterThanOrEqual(firstLoop.scoreBefore!);

    // 5. Verify Planner refined active hypotheses based on Critic's critique
    const hasRefinedHypothesis = result.plan?.hypotheses.some(h =>
      h.includes("Refined via Epistemic Critic")
    );
    expect(hasRefinedHypothesis).toBe(true);

    // 6. Verify max-loop cap prevents infinite execution (max 2 evidence loops)
    const evidenceLoops = result.replanHistory!.filter(
      l => l.from === "critic" && l.to === "searcher"
    );
    expect(evidenceLoops.length).toBeLessThanOrEqual(2);
  }, 25000);
});

