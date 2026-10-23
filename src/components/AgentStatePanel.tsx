'use client';

import React from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { AgentStatus, ResearchWorkflowState } from '../lib/types';

interface AgentStatePanelProps {
  stageName: string;
  outputName: string;
  status: AgentStatus;
  workflowStatus?: ResearchWorkflowState['status'];
  icon: React.ReactNode;
  idleMessage: string;
  currentTask?: string;
  errorMessage?: string;
  className?: string;
}

export const AgentStatePanel: React.FC<AgentStatePanelProps> = ({
  stageName,
  outputName,
  status,
  workflowStatus,
  icon,
  idleMessage,
  currentTask,
  errorMessage,
  className = '',
}) => {
  const effectiveStatus =
    workflowStatus === 'error'
      ? 'error'
      : workflowStatus === 'running' && (status === 'idle' || status === 'waiting')
        ? 'waiting'
        : workflowStatus === 'completed' && (status === 'idle' || status === 'waiting')
          ? 'completed'
          : status;
  const isError = effectiveStatus === 'error';
  const isRunning = effectiveStatus === 'running';
  const title = isError
    ? `${stageName} couldn't complete`
    : isRunning
      ? `${stageName} in progress`
      : effectiveStatus === 'waiting'
        ? `${stageName} is waiting`
        : effectiveStatus === 'completed'
          ? `No ${outputName} available`
          : `${outputName} not available yet`;
  const message = isError
    ? errorMessage
      ? `${errorMessage} Check the Message Bus Logs for details, then retry the research run.`
      : 'Review the Message Bus Logs for details, then retry the research run.'
    : isRunning
      ? currentTask || `This may take a few moments. Results will appear here as ${stageName} works.`
      : effectiveStatus === 'waiting'
        ? 'This stage will begin when its upstream research is ready.'
        : effectiveStatus === 'completed'
          ? `This stage completed without producing ${outputName.toLowerCase()}.`
          : idleMessage;

  return (
    <section
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-busy={isRunning}
      className={`liquid-glass p-5 sm:p-12 text-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 mx-auto flex items-center justify-center">
        {isError ? (
          <AlertCircle className="w-10 h-10 text-rose-500" aria-hidden="true" />
        ) : isRunning ? (
          <LoaderCircle className="w-10 h-10 text-cyan-500 animate-spin" aria-hidden="true" />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-base font-bold text-current">{title}</h3>
      <p className="text-xs opacity-70 max-w-md mx-auto">{message}</p>
    </section>
  );
};
