import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComponentProps } from 'react';
import { AgentStatePanel } from '../src/components/AgentStatePanel';

const renderPanel = (props: Partial<ComponentProps<typeof AgentStatePanel>> = {}) =>
  renderToStaticMarkup(
    <AgentStatePanel
      stageName="Strategic Planner"
      outputName="research plan"
      status="idle"
      icon={<span aria-hidden="true">Planner</span>}
      idleMessage="Start a research run."
      {...props}
    />,
  );

describe('AgentStatePanel', () => {
  it('explains that an idle stage has not produced output yet', () => {
    const markup = renderPanel();

    expect(markup).toContain('role="status"');
    expect(markup).toContain('research plan not available yet');
    expect(markup).toContain('Start a research run.');
  });

  it('announces an active task while a stage is running', () => {
    const markup = renderPanel({ status: 'running', currentTask: 'Reviewing sources' });

    expect(markup).toContain('Strategic Planner in progress');
    expect(markup).toContain('Reviewing sources');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('animate-spin');
  });

  it('sets expectations when a running stage has no task detail', () => {
    const markup = renderPanel({ status: 'running' });

    expect(markup).toContain('This may take a few moments.');
    expect(markup).toContain('Results will appear here as Strategic Planner works.');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-busy="true"');
  });

  it('identifies a stage that is waiting for upstream research', () => {
    const markup = renderPanel({ workflowStatus: 'running' });

    expect(markup).toContain('Strategic Planner is waiting');
    expect(markup).toContain('This stage will begin when its upstream research is ready.');
    expect(markup).toContain('aria-busy="false"');
  });

  it('explains when a completed workflow produced no stage output', () => {
    const markup = renderPanel({ workflowStatus: 'completed' });

    expect(markup).toContain('No research plan available');
    expect(markup).toContain('This stage completed without producing research plan.');
  });

  it('announces workflow failures as alerts with the supplied error', () => {
    const markup = renderPanel({
      status: 'idle',
      workflowStatus: 'error',
      errorMessage: 'The research request failed.',
    });

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-live="assertive"');
    expect(markup).toContain('Strategic Planner couldn&#x27;t complete');
    expect(markup).toContain('The research request failed.');
    expect(markup).toContain('Check the Message Bus Logs for details, then retry the research run.');
  });
});
