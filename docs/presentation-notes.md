# Presentation Notes

## Project
Multi-Agent Research and Report Factory

## Overview
A Next.js application that coordinates specialized AI agents to research a user-provided topic and create a structured report. It can run in simulated mode, with an optional Gemini API integration for live generation.

## Key Features
- Planner creates focused research questions from a topic.
- Searcher identifies relevant sources and research gaps.
- Reader extracts evidence from documents and uploaded files.
- Critic reviews confidence, bias, quality, and contradictions.
- Writer combines the research into a structured report.
- Dashboard displays agent status, progress, and workflow events.
- Includes red-team review modes, document uploads, and automated tests.

## Presentation Points
- Show how one topic moves through the Planner, Searcher, Reader, Critic, and Writer workflow.
- Explain how the Critic checks evidence and can request additional research.
- Demonstrate the dashboard and generated report.
- Mention that Gemini API integration is optional; the app also supports simulated mode.

## Team Notes
- Make changes on a feature branch, not directly on `main`.
- Push the feature branch to your fork and open a pull request for review.