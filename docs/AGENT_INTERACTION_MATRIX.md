# Multi-Agent Interaction Matrix

| Sender Agent | Recipient Agent | Message Type | Payload Structure |
|---|---|---|---|
| Orchestrator | Planner | PLAN_REQUEST | { topic, depth, customInstructions } |
| Planner | Searcher | SEARCH_DIRECTIVES | { queries, targetDomains } |
| Searcher | Reader | RAW_DOCUMENTS | { documents, urls } |
| Reader | Critic | EXTRACTED_FACTS | { facts, sourceIds } |
| Critic | Planner | REPLAN_DIRECTIVE | { shortfalls, recommendedActions } |
| Critic | Writer | AUDITED_SYNTHESIS_PACK | { approvedFacts, scorecards } |
| Writer | Orchestrator | FINAL_REPORT | { report, citations } |
