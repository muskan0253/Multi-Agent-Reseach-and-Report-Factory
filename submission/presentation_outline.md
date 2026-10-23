# Presentation Outline: Multi-Agent Research & Report Factory

**Exam Studio Track:** Autonomous Multi-Agent Workflows & Advanced Agentic Coding  
**Presenter:** Anushka Tandon (@AnushkaTandon26)  
**Project:** Multi-Agent Research & Report Factory  
**Live Demo:** [Vercel Deployment / GitHub](https://github.com/AnushkaTandon26/Multi-Agent-Reseach-and-Report-Factory)

---

## Slide 1: Title & Abstract
- **Title:** Multi-Agent Research & Report Factory: Autonomous Evaluator-Optimizer Workflows for Cited Enterprise Intelligence
- **Presenter:** Anushka Tandon
- **Core Value Proposition:** Transitioning research generation from monolithic, hallucinatory single-turn LLMs to an asynchronous 5-station agent factory with closed-loop epistemic verification.

---

## Slide 2: The Core Problem
- **Hallucination in High-Stakes Briefs:** Generalist LLMs synthesize smooth prose with fabricated citations.
- **Linear Fragility:** Sequential chains fail when early steps retrieve poor or biased information.
- **Missing Adversarial Rigor:** Standard agents suffer from confirmation bias and lack counter-thesis stress-testing.

---

## Slide 3: Multi-Agent System Architecture
- **Station 01: Strategic Planner:** Deconstructs prompts into MECE questions and working hypotheses.
- **Station 02: Scout Searcher:** Dispatches concurrent live web and academic probes (IEEE, Nature, arXiv).
- **Station 03: Deep Reader:** Mines and structures factual claims, metrics, and quantitative benchmarks.
- **Station 04: Epistemic Critic:** Audits authority, scores domain reliability, and identifies knowledge gaps.
- **Station 05: Executive Synthesizer:** Authors cited whitepapers with standard bracketed footnote references.

---

## Slide 4: Non-Linear Evaluator-Optimizer Loop (The Key Differentiator)
- **The Critic Gate:** If overall reliability < 80% or evidence gaps exist, Critic triggers `request_more_evidence`.
- **Causal Flow:** Critic ➔ Searcher (Refined Query Vectors) ➔ Reader (Additional Facts) ➔ Critic (Re-Audit) ➔ Planner (Hypothesis Refinement).
- **Memory Coherence:** All agents coordinate via typed inter-agent message bus and synchronized shared run memory (`verifiedFacts`, `rejectedSources`, `activeHypotheses`).

---

## Slide 5: Adversarial Red Team Stress-Testing
- Uncovers supply-chain concentration risks, cost-parity blindspots, and regulatory certification bottlenecks.
- Simulates worst-case commercial failure scenarios to produce balanced, defensible intelligence.

---

## Slide 6: Engineering Rigor & UI Design
- **Apple Liquid Glass Dark UI:** visionOS/Linear aesthetic, drifting gradient blur orbs, frosted glass depth, WCAG AA compliance.
- **Telemetry & Traceability:** Machine-readable JSON execution traces with millisecond tool call telemetry and message bus replay.
- **Quality Assurance:** 10 Vitest unit/integration tests with deterministic feedback loop validation, Next.js 14 production build.

---

## Slide 7: Conclusion & Roadmap
- Modular architecture allowing hot-swapping agent backends (Gemini 1.5 Pro, Flash, Claude, OpenAI).
- Enterprise document vault integration (BYOD) for proprietary internal synthesis.
- Live Q&A and Demo link.
