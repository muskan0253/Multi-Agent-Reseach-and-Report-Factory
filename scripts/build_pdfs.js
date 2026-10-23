const fs = require('fs');

function escapePdfText(text) {
  return text.split('\\').join('\\\\').split('(').join('\\(').split(')').join('\\)');
}

function createPdf(filename, title, sections) {
  let stream = '';
  stream += 'BT\n';
  stream += '/F2 16 Tf\n';
  stream += '50 740 Td\n';
  stream += '(' + escapePdfText(title) + ') Tj\n';
  stream += 'ET\n';

  let currentY = 700;
  for (const sec of sections) {
    stream += 'BT\n/F2 12 Tf\n50 ' + currentY + ' Td\n(' + escapePdfText(sec.heading) + ') Tj\nET\n';
    currentY -= 18;
    stream += 'BT\n/F1 10 Tf\n50 ' + currentY + ' Td\n';
    for (const line of sec.lines) {
      stream += '(' + escapePdfText(line) + ') Tj\nT*\n';
      currentY -= 14;
    }
    stream += 'ET\n';
    currentY -= 14;
    if (currentY < 80) break;
  }

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj');
  objects.push('4 0 obj\n<< /Length ' + Buffer.byteLength(stream) + ' >>\nstream\n' + stream + '\nendstream\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');

  let pdfData = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfData.length);
    pdfData += objects[i] + '\n';
  }
  const xrefOffset = pdfData.length;
  pdfData += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    pdfData += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdfData += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';

  fs.writeFileSync(filename, pdfData, 'binary');
  console.log('Generated:', filename, Buffer.byteLength(pdfData), 'bytes');
}

const synopsisSections = [
  { heading: '1. Executive Overview & Problem Statement', lines: ['Modern generative AI workflows frequently suffer from hallucinations and superficial synthesis.', 'Multi-Agent Research Factory coordinates 5 autonomous agents (Planner, Searcher, Reader, Critic, Writer).', 'The system introduces a dynamic evaluator-optimizer feedback loop for verification.'] },
  { heading: '2. Team Details & System Architecture', lines: ['Team Name: CodeVerse | Team Lead: Anushka Tandon (PRN: 23070122262)', 'Architecture: Orchestrator -> Planner -> Searcher -> Reader -> Critic (Loop) -> Writer.'] },
  { heading: '3. Core Innovations & Key Results', lines: ['Closed-loop audit: Critic triggers targeted re-planning when fact confidence drops below 80.', 'Full transparency with real-time execution trace, Vitest test suite, and clean modern web UI.'] }
];

const designSections = [
  { heading: '1. Architecture & Agent Specialization', lines: ['The platform implements 5 specialized agents with distinct domain responsibilities:', 'PlannerAgent (Decomposition), SearcherAgent (Targeted retrieval), ReaderAgent (Fact extraction),', 'CriticAgent (Rubric verification & closed-loop replan trigger), WriterAgent (Whitepaper synthesis).'] },
  { heading: '2. Inter-Agent Communication & Replanning Loop', lines: ['Decoupled pub-sub message bus ensures clean event-driven state transitions.', 'CriticAgent enforces academic credibility scoring (Authority 30%, Freshness 25%, Rigor 25%, Consensus 20%).', 'Feedback loop re-engages Planner & Searcher dynamically when evidence gaps occur.'] },
  { heading: '3. Data Flow & Security Guarantees', lines: ['Immutable execution traces, schema-validated payloads (Zod/JSON Schema), local sandbox execution.'] }
];

createPdf('docs/PROJECT_SYNOPSIS.pdf', 'Multi-Agent Research Factory: Project Synopsis', synopsisSections);
createPdf('docs/DESIGN_DOCUMENT.pdf', 'Multi-Agent Research Factory: Design Document', designSections);
