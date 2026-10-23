# Multi-Agent Research & Report Factory

A Next.js application for running a multi-agent research workflow that plans, searches, reads, critiques, and writes publication-quality reports based on a user-defined topic.

## Overview

This project simulates a research lab where multiple specialized agents collaborate to explore a topic, validate evidence, and generate a structured final report. The workflow is designed to mirror real research operations:

- Planner breaks a broad prompt into structured research questions
- Searcher identifies relevant sources and coverage gaps
- Reader extracts facts and evidence from documents and uploaded files
- Critic evaluates confidence, bias, quality, and contradictions
- Writer synthesizes the final research output and summary

The app includes both an interactive dashboard and an orchestration layer that can run in simulated mode or with an optional live Gemini API connection.

## Key Features

- Topic-driven research workflow with adjustable depth and persona
- Multi-agent live dashboard with status, task progress, and workflow events
- Red-team and critical review modes
- Custom document upload support
- Search scope configuration and preset topics
- Generated report view with sourced findings and structured output
- Optional Gemini API integration for live generation
- Vitest-based automated testing

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Markdown / remark / rehype
- Google Generative AI SDK
- Vitest

## Project Structure

```text
.
├── docs/                     # Design notes, architecture docs, and sample traces
├── src/
│   ├── app/                  # App routes and page entrypoints
│   ├── components/           # Dashboard, panels, modal dialogs, and views
│   ├── lib/                  # Shared types, orchestrator logic, and agent definitions
│   └── ...
├── tests/                    # Test files
├── Dockerfile
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
├── .gitignore
├── README.md
└── package-lock.json
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the local development server:

```bash
npm run dev
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Available Scripts

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm run start    # run the production build locally
npm run lint     # lint the app
npm test         # run the test suite
```

## Environment Variables

This project can run in simulated mode without any API keys. To enable live Gemini generation, create a `.env.local` file and add:

```env
GEMINI_API_KEY=your_api_key_here
```

## How to Use

1. Enter a research topic.
2. Choose the research depth and output persona.
3. Specify the search scope and red-team preferences.
4. Optionally upload custom documents.
5. Start the workflow and monitor each agent's progress in real time.

## Documentation

Relevant docs are located in the `docs/` directory:

- `docs/SYNOPSIS.md`
- `docs/DESIGN.md`
- `docs/INPUT_OUTPUT.md`
- `docs/sample_trace.md`
- `docs/sample_trace.json`

## Docker

```bash
docker build -t research-factory:latest .
docker run -p 3000:3000 research-factory:latest
```

## Notes

This project is intended as a research workflow prototype and product demo. It focuses on agent coordination, evidence evaluation, and report synthesis in a web-based interface.


## Multi-Agent Replanning Loop
The system implements a dynamic generator-evaluator loop where the CriticAgent actively critiques extracted claims and triggers targeted replan directives to the Planner and Searcher.
