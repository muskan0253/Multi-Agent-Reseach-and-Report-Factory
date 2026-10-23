import { AgentMessage, AgentType, AgentMessageType } from '../types';

export type MessageBusSubscriber = (message: AgentMessage) => void;

export class AgentMessageBus {
  private messages: AgentMessage[] = [];
  private subscribers: MessageBusSubscriber[] = [];

  constructor() {}

  public subscribe(subscriber: MessageBusSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }

  public publish(
    from: AgentType,
    to: AgentType | 'broadcast',
    type: AgentMessageType,
    payload: any,
    reasoning: string
  ): AgentMessage {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      from,
      to,
      type,
      payload,
      reasoning,
    };

    this.messages.push(message);

    for (const subscriber of this.subscribers) {
      try {
        subscriber(message);
      } catch (err) {
        console.error('[AgentMessageBus] Error delivering message to subscriber:', err);
      }
    }

    return message;
  }

  public getMessages(): AgentMessage[] {
    return [...this.messages];
  }

  public getMessagesForAgent(agent: AgentType): AgentMessage[] {
    return this.messages.filter(m => m.from === agent || m.to === agent || m.to === 'broadcast');
  }

  public clear(): void {
    this.messages = [];
  }
}

// Bus channel telemetry marker
export const BUS_CHANNEL_TIMEOUT_MS = 30000;
