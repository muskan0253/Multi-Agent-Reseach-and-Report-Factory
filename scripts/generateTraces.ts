import { ResearchOrchestrator } from '../src/lib/agents/orchestrator';
import fs from 'fs';

async function main() {
  console.log('Running ResearchOrchestrator for trace generation...');
  const orchestrator = new ResearchOrchestrator(
    'Commercial Viability of Solid-State Batteries by 2030',
    'quick',
    'executive',
    'all',
    true,
    'Focus on automotive pilot programs, energy density (Wh/kg), manufacturing scaling hurdles, and 2030 cost per kWh compared to LFP/NMC.',
    [],
    { mockMode: true }
  );

  const state = await orchestrator.run();
  const trace = state.trace;
  const report = state.report;

  fs.writeFileSync('./docs/sample_trace.json', JSON.stringify(trace, null, 2), 'utf-8');

  let md = `# Execution Trace: Multi-Agent Research & Report Factory\n\n`;
  md += `- **Trace ID:** \`${trace?.traceId}\`\n`;
  md += `- **Timestamp:** ${new Date(trace?.timestamp || Date.now()).toISOString()}\n`;
  md += `- **Topic:** ${trace?.topic}\n`;
  md += `- **Depth:** ${trace?.depth} | **Persona:** ${trace?.persona}\n`;
  md += `- **Total Duration:** ${((trace?.totalDurationMs || 0) / 1000).toFixed(2)}s\n`;
  md += `- **Agents Executed:** ${trace?.agentsExecuted?.join(' → ')}\n\n`;
  md += `---\n\n`;

  md += `## 1. Executive Summary & Epistemic Audit\n\n`;
  md += `- **Report Title:** ${trace?.finalReportSummary?.title}\n`;
  md += `- **Word Count:** ${trace?.finalReportSummary?.wordCount} words\n`;
  md += `- **Citations:** ${trace?.finalReportSummary?.citationCount} authoritative sources\n`;
  md += `- **Epistemic Reliability Score:** ${trace?.finalReportSummary?.epistemicScore}/100\n\n`;
  md += `---\n\n`;

  md += `## 2. Adaptive Evaluator-Optimizer Feedback Loops (${trace?.replanLoops?.length || 0} Loops)\n\n`;
  (trace?.replanLoops || []).forEach(l => {
    md += `### Loop #${l.loopNumber}: ${l.from.toUpperCase()} ➔ ${l.to.toUpperCase()}\n`;
    md += `- **Causal Reason:** ${l.reason}\n`;
    md += `- **Details:** ${l.details || 'Re-dispatched queries to eliminate information gaps'}\n`;
    md += `- **Score Progression:** Before: ${l.scoreBefore ?? 'N/A'}/100 | After: ${l.scoreAfter ?? 'N/A'}/100\n`;
    if (l.queryBefore && l.queryBefore.length > 0) {
      md += `- **Query Prior:** \`${l.queryBefore[0]}\`\n`;
    }
    if (l.queryAfter && l.queryAfter.length > 0) {
      md += `- **Refined Query Vector:** \`${l.queryAfter[0]}\`\n`;
    }
    md += `\n`;
  });
  md += `---\n\n`;

  md += `## 3. Shared Memory State\n\n`;
  md += `- **Verified Facts Count:** ${trace?.sharedMemorySnapshot?.verifiedFacts?.length || 0}\n`;
  md += `- **Replan Count:** ${trace?.sharedMemorySnapshot?.replanCount || 0}\n`;
  md += `- **Knowledge Gaps Identified:**\n`;
  (trace?.sharedMemorySnapshot?.knowledgeGaps || []).forEach(gap => {
    md += `  - ${gap}\n`;
  });
  md += `- **Active Working Hypotheses (Refined via Epistemic Critic):**\n`;
  (trace?.sharedMemorySnapshot?.activeHypotheses || []).forEach(h => {
    md += `  - ${h}\n`;
  });
  md += `\n---\n\n`;

  md += `## 4. Inter-Agent Message Bus Log (${trace?.messages?.length || 0} Messages)\n\n`;
  md += `| From | To | Type | Summary |\n|---|---|---|---|\n`;
  (trace?.messages || []).forEach(m => {
    const summaryText = (m.summary || JSON.stringify(m.payload) || '').replace(/\|/g, '-');
    md += `| ${m.from} | ${m.to} | \`${m.type}\` | ${summaryText} |\n`;
  });
  md += `\n---\n\n`;

  md += `## 5. Tool Call Execution Telemetry (${trace?.toolCalls?.length || 0} Calls)\n\n`;
  md += `| Agent | Tool | Duration | Status | Sample Input |\n|---|---|---|---|---|\n`;
  (trace?.toolCalls || []).forEach(t => {
    md += `| ${t.agent} | \`${t.toolName}\` | ${t.durationMs}ms | ${t.success ? '✅ Success' : '❌ Failed'} | \`${JSON.stringify(t.input).substring(0, 45).replace(/\|/g, '-')}...\` |\n`;
  });
  md += `\n`;

  fs.writeFileSync('./docs/sample_trace.md', md, 'utf-8');
  fs.writeFileSync('./submission/execution_trace.txt', md, 'utf-8');
  console.log('Trace generation complete!');
}

main().catch(console.error);
