# Multi-Agent Dynamic Replanning Architecture

## Overview
This architecture establishes a closed-loop bidirectional coordination between the CriticAgent, PlannerAgent, and SearcherAgent.

### Replanning Workflow
1. **Evaluation Phase**: The Critic assesses extracted facts against credibility metrics.
2. **Feedback Generation**: If confidence is below 80, the Critic issues specific target directives.
3. **Query Expansion**: The Planner expands search vectors to resolve specific evidentiary gaps.
4. **Directed Search**: SearcherAgent executes targeted probes.
