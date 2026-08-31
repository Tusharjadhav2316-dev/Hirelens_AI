export type AgentEventType =
  | "agent_started"
  | "agent_completed"
  | "tool_started"
  | "tool_completed"
  | "message_delta"
  | "artifact"
  | "action_required"
  | "error"
  | "completed";

export interface AgentStartedEvent {
  type: "agent_started";
  agent: string;
}

export interface AgentCompletedEvent {
  type: "agent_completed";
  agent: string;
}

export interface ToolStartedEvent {
  type: "tool_started";
  agent: string;
  tool: string;
}

export interface ToolCompletedEvent {
  type: "tool_completed";
  agent: string;
  tool: string;
}

export interface MessageDeltaEvent {
  type: "message_delta";
  agent: string;
  text: string;
}

export interface ArtifactEvent {
  type: "artifact";
  artifact: {
    type: string;
    status?: string;
    data?: Record<string, any>;
    [key: string]: any;
  };
}

export interface ActionRequiredEvent {
  type: "action_required";
  actions: Array<Record<string, any>>;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export interface CompletedEvent {
  type: "completed";
}

export type AgentEvent =
  | AgentStartedEvent
  | AgentCompletedEvent
  | ToolStartedEvent
  | ToolCompletedEvent
  | MessageDeltaEvent
  | ArtifactEvent
  | ActionRequiredEvent
  | ErrorEvent
  | CompletedEvent;

/**
  * Async generator that reads an NDJSON HTTP response stream byte-by-byte,
  * buffers lines split across chunk boundaries, and yields parsed AgentEvent objects.
  */
export async function* streamAgentEvents(response: Response): AsyncGenerator<AgentEvent> {
  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // Preserve trailing partial line for the next chunk read
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed) as AgentEvent;
          yield parsed;
        } catch (parseError) {
          console.warn("Failed to parse NDJSON event line:", trimmed, parseError);
        }
      }
    }
  }

  // Flush any remaining buffer line after stream closes
  const finalTrimmed = buffer.trim();
  if (finalTrimmed) {
    try {
      const parsed = JSON.parse(finalTrimmed) as AgentEvent;
      yield parsed;
    } catch (parseError) {
      console.warn("Failed to parse final trailing NDJSON event line:", finalTrimmed, parseError);
    }
  }
}
