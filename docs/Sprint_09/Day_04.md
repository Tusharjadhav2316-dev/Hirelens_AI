# Sprint 9 — Day 4

## Day Title
Question Personalization — Interview Type, Difficulty, and Mode Classification

## Objective
Extend `prepare_interview_questions` with backward-compatible `interview_type` and `difficulty` parameters, classify and implement the Sprint 9 MVP interview modes (HR, Behavioral, Technical, Mixed — Resume-Based and JD-Based are automatic context uses, not selectable modes), and document the transparent difficulty-progression rule that Day 5's adaptive logic will apply.

## Why This Day Exists
The brief asks for a mode system and a difficulty model but explicitly warns against "blindly implementing every mode." Today makes the classification decision concrete in code: which modes get built now, which are folded into existing modes, and which are deferred — matching the classification already made in `20_Decision_Log.md`.

## Repository Evidence / Current State
`prepare_interview_questions` (existing, Sprint 8) accepts `role`, `count`, `resume_text`, `job_description` and always produces a mixed technical/behavioral question set with no category-weighting control and no difficulty tagging in its fallback path (`InterviewQuestionItem.difficulty` field exists in the TypeScript type but the Python tool's fallback questions never populate it).

## Concepts
- Mode-as-parameter vs. mode-as-separate-tool (recap of the Decision Log's "modes are a filter, not a separate agent path" ADR).
- Transparent difficulty progression as a documented rule, not a hidden scoring model — the brief's "avoid arbitrary score manipulation" requirement.

## Prerequisites
Day 3 complete: context resolution wired.

## Setup
No new dependencies.

## Resources
- `20_Decision_Log.md`'s "Question-count and difficulty selection reuse existing fields" ADR
- `02_Architecture.md`'s Adaptive Follow-Up Decision Rule section (difficulty-stepping half of that rule is implemented today; the follow-up-triggering half is Day 5)

## Files to Inspect
- `agent-service/tools/interview_tools.py` (current `prepare_interview_questions` implementation)
- `frontend/types/agent.ts` (`InterviewQuestionItem.difficulty` field, already present but unpopulated by the fallback path)

## Files to Modify
- `agent-service/tools/interview_tools.py` — `prepare_interview_questions` extended with `interview_type`/`difficulty` params, prompt updated to request category-weighted, difficulty-tagged questions; fallback questions updated to populate `difficulty`

## Files to Create
- `agent-service/tests/test_interview_question_personalization.py`

## Architecture Impact
No new tool, no new agent — this is a backward-compatible extension of an existing, already-authorized tool. Sprint 8's Route 4 call site (still calling with only `role`/`count`/`resume_text`/`job_description`) continues to work unchanged, now implicitly using the new parameters' defaults (`interview_type="mixed"`, `difficulty="intermediate"`).

## Data Flow
```
prepare_interview_questions(role, count, resume_text, job_description, interview_type, difficulty)
  -> system_prompt now includes: "Focus questions on {interview_type} category. Target difficulty: {difficulty}."
  -> OpenRouter call (unchanged mechanism)
  -> parsed questions now expected to include a "difficulty" field per question (prompted for explicitly)
  -> fallback path (no API key) also populates difficulty on each synthetic question
```

## Implementation Plan

### Step 1 — Mode Classification (Locked, from Decision Log)
| Mode | Status | Implementation |
|---|---|---|
| HR | Core | `interview_type="hr"` |
| Behavioral | Core | `interview_type="behavioral"` (STAR-structure guidance included in prompt where naturally applicable, not forced) |
| Technical | Core | `interview_type="technical"` (includes project-deep-dive and general technical topics — see Step 3) |
| Mixed | Core, default | `interview_type="mixed"` (Sprint 8's existing unparameterized behavior, preserved as the default) |
| Resume-Based | Core, automatic | Not a selectable mode — used automatically whenever `resume_text` is present, regardless of `interview_type` |
| JD-Based | Core, automatic | Not a selectable mode — used automatically whenever `job_description` is present, regardless of `interview_type` |
| Coding / Problem-Solving (live execution) | Deferred | No code-execution sandbox exists; folded into Technical mode as text-based technical questions only |
| Project-Based (as a separate mode) | Folded into Technical | Project questions are a Technical-mode emphasis (see Day 4 Step 3), not a distinct selectable mode |
| Voice / Video | Explicitly out of scope | Per the brief's Voice/Video Boundary |

### Step 2 — Extend `prepare_interview_questions`
```python
@tool("prepare_interview_questions")
def prepare_interview_questions(
    role: str = "Software Engineer",
    count: int = 5,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    interview_type: Literal["hr", "behavioral", "technical", "mixed"] = "mixed",
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate",
) -> str:
    # ... existing guardrail/truncation logic unchanged ...
    system_prompt = (
        f"{INTERVIEW_GUARDRAIL}\n"
        f"Focus questions on the '{interview_type}' category. Target difficulty: {difficulty}. "
        f"Tag each question's own difficulty field, which may vary slightly around the target. "
        f"Output ONLY valid JSON containing a list of {safe_count} structured interview questions."
    )
    # ... user_prompt unchanged except JSON schema example now includes "difficulty": "Easy|Medium|Hard" ...
```

### Step 3 — Project Deep-Dive as a Technical-Mode Prompt Instruction
Rather than a separate mode or tool, the Technical-mode system prompt explicitly instructs: "When the resume lists specific projects, prefer project-specific questions (architecture, technical decisions, challenges, contribution, trade-offs) over generic technical trivia, progressively increasing specificity for questions about the same project if multiple are asked." This directly implements the brief's "Project Deep-Dive" section as a prompt-level behavior of the existing tool, not new infrastructure.

### Step 4 — Fallback Path Difficulty Population
```python
fallback_questions.append({
    "id": i,
    "category": interview_type.capitalize(),
    "difficulty": difficulty.capitalize(),   # NEW - previously omitted
    "question": f"Question {i}: Can you describe your experience and approach relevant to the {clean_role} position?",
    "rationale": f"Standard mock interview question for {clean_role} role ({interview_type}, {difficulty})."
})
```

## Ready-to-Paste Antigravity Prompt
"Extend `prepare_interview_questions` in `agent-service/tools/interview_tools.py` with `interview_type: Literal['hr','behavioral','technical','mixed'] = 'mixed'` and `difficulty: Literal['beginner','intermediate','advanced'] = 'intermediate'` parameters, both with defaults matching Sprint 8's existing unparameterized behavior so the current Route 4 call site keeps working unchanged. Update the system prompt to focus on the given category/difficulty and request a `difficulty` field per question. Update the fallback (no-API-key) path to also populate a `difficulty` field per synthetic question."

## Testing
- `test_interview_question_personalization.py`: calling with no `interview_type`/`difficulty` args produces the same shape of result as Sprint 8's original call signature (backward compatibility); calling with `interview_type="technical"` and a resume containing named projects produces (in the fallback path, deterministically) project-referencing question text; fallback questions always include a populated `difficulty` field.

## Regression Testing
Re-run Sprint 8's `test_interview_tools.py` unchanged — must still pass, since all new parameters have non-breaking defaults.

## Manual Verification
Call the tool with each of the 4 `interview_type` values and confirm the returned questions are visibly weighted toward that category (technical → mostly technical/project questions; hr → mostly HR-style questions).

## Expected Behaviour
Question generation is now personalizable by type and difficulty without any change to how Sprint 8's existing call site behaves.

## Failure Cases
An invalid `interview_type`/`difficulty` string should be rejected by Pydantic/type validation before reaching the OpenRouter call, not silently coerced to a default that hides the caller's mistake.

## Debugging Guidance
If generated questions don't seem to respect the requested `interview_type`, check the system prompt text is actually being interpolated correctly before suspecting the underlying model's instruction-following — a string-formatting bug is more likely than a prompting failure at this stage.

## Security Considerations
No new security surface — this extends an existing, already-guardrailed tool's parameters; the guardrail text itself is unchanged.

## Checklist
- [x] `prepare_interview_questions` extended with backward-compatible `interview_type`/`difficulty` params
- [x] Mode classification table implemented as documented (no extra modes added)
- [x] Fallback path populates `difficulty` on every synthetic question
- [x] `test_interview_question_personalization.py` passing
- [x] Sprint 8's original `test_interview_tools.py` still passing unchanged

## Commit Message
`feat(sprint9-day4): interview_type and difficulty parameters for personalized question generation`

## Documentation Updates
`20_Decision_Log.md`'s mode-classification ADR is the design this day implements; no further changes needed.

## End-of-Day Review
Question generation can now be meaningfully personalized by mode and difficulty, entirely within the existing tool — no new tool, no new agent, no breaking change.

## Tomorrow Preview
Day 5 builds the mock interview session flow itself — wiring `interview_manager.py`'s `start_session`/`advance_session` into a real Manager route, and implementing the adaptive follow-up decision rule that uses today's difficulty groundwork.
