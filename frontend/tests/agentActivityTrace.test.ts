import { updateTraceFromEvent, TraceStep } from "../components/agent/AgentActivityTrace";
import { AgentEvent } from "../lib/agentStreamClient";

async function runActivityTraceTest() {
    console.log("=== Agent Activity Trace State Transition Test Suite ===\n");

    let steps: TraceStep[] = [];

    // Step 1: agent_started event
    const event1: AgentEvent = { type: "agent_started", agent: "manager" };
    steps = updateTraceFromEvent(steps, event1);

    console.log("Asserting event 1: agent_started manager...");
    if (steps.length !== 1 || steps[0].status !== "active" || steps[0].agent !== "manager") {
        console.error("FAILED: agent_started state transition invalid", steps);
        process.exit(1);
    }
    console.log("  ✓ Manager agent started with active status!");

    // Step 2: tool_started event
    const event2: AgentEvent = { type: "tool_started", agent: "ats_agent", tool: "get_ats_analysis" };
    steps = updateTraceFromEvent(steps, event2);

    console.log("Asserting event 2: tool_started get_ats_analysis...");
    if (steps.length !== 2 || steps[1].tool !== "get_ats_analysis" || steps[1].status !== "active") {
        console.error("FAILED: tool_started state transition invalid", steps);
        process.exit(1);
    }
    console.log("  ✓ ATS tool started with active status & tool label!");

    // Step 3: tool_completed event
    const event3: AgentEvent = { type: "tool_completed", agent: "ats_agent", tool: "get_ats_analysis" };
    steps = updateTraceFromEvent(steps, event3);

    console.log("Asserting event 3: tool_completed...");
    if (steps[1].tool !== undefined) {
        console.error("FAILED: tool_completed should clear active tool property", steps[1]);
        process.exit(1);
    }
    console.log("  ✓ Active tool cleared on tool completion!");

    // Step 4: agent_completed event
    const event4: AgentEvent = { type: "agent_completed", agent: "ats_agent" };
    steps = updateTraceFromEvent(steps, event4);

    console.log("Asserting event 4: agent_completed...");
    if (steps[1].status !== "completed") {
        console.error("FAILED: agent_completed status should be completed", steps[1]);
        process.exit(1);
    }
    console.log("  ✓ ATS agent step marked completed!");

    // Step 5: completed event
    const event5: AgentEvent = { type: "completed" };
    steps = updateTraceFromEvent(steps, event5);

    console.log("Asserting event 5: overall completed...");
    if (steps.some(s => s.status === "active")) {
        console.error("FAILED: completed event should clear remaining active steps", steps);
        process.exit(1);
    }
    console.log("  ✓ All active steps cleanly finalized on completed event!");

    console.log("\n=== Results: 5/5 trace state transitions verified successfully! ===");
}

runActivityTraceTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
