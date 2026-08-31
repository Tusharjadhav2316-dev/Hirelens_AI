import { streamAgentEvents, AgentEvent } from "../lib/agentStreamClient";

async function runClientStreamTest() {
  console.log("=== Agent Stream Client Line Buffering Test Suite ===\n");

  const chunk1 = '{"type":"agent_started","agent":"manager"}\n{"type":"tool_start';
  const chunk2 = 'ed","agent":"ats_agent","tool":"get_ats_analysis"}\n{"type":"completed"}\n';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(chunk1));
      controller.enqueue(encoder.encode(chunk2));
      controller.close();
    },
  });

  const response = new Response(stream);
  const events: AgentEvent[] = [];

  for await (const event of streamAgentEvents(response)) {
    events.push(event);
  }

  console.log(`Received ${events.length} parsed events.`);
  
  if (events.length !== 3) {
    console.error(`FAILED: Expected 3 events, got ${events.length}`);
    process.exit(1);
  }

  if (events[0].type !== "agent_started" || events[0].agent !== "manager") {
    console.error("FAILED: Event 0 mismatch", events[0]);
    process.exit(1);
  }

  if (events[1].type !== "tool_started" || events[1].tool !== "get_ats_analysis") {
    console.error("FAILED: Event 1 chunk-split parse mismatch", events[1]);
    process.exit(1);
  }

  if (events[2].type !== "completed") {
    console.error("FAILED: Event 2 mismatch", events[2]);
    process.exit(1);
  }

  console.log("  ✓ Correctly buffered NDJSON lines split across chunk boundaries!");
  console.log("\n=== Results: 3/3 events parsed successfully across chunk split ===");
}

runClientStreamTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
