# Sprint 6 — Day 3: Career Coach Page Shell & Sidebar Integration

## Day Title
**AI Career Coach — Page Shell, Navigation & UI Structure**

## Objective
Create the Career Coach page at `/dashboard/career-coach` and integrate it into the application's navigation. Today builds the full UI structure — empty state, starter prompt chips, chat message layout skeleton, and the text input — but does not yet wire live API calls (that is Day 4).

## Why This Day Exists
Separating UI structure from API wiring is a deliberate choice. Building the shell first means Day 4 has a real, rendered component to wire into — no abstract placeholders. It also means the page can be visually reviewed and iterated on independently of stream-reading complexity. The Sidebar integration on Day 3 means "AI Career Coach" appears in the nav immediately, making the feature discoverable to anyone reviewing the work in progress.

## Repository Evidence / Current State
- **`components/Sidebar.tsx`** — confirmed: `navigationItems` array with 6 entries (Dashboard, Resume Builder, Resume Analyzer, Job Matcher, Cover Letter, Resume History). Uses `lucide-react` icons (`LayoutDashboard`, `FileEdit`, `Search`, `Target`, `Mail`, `History`, `Settings`). Pattern for adding a new item: one object in the array, one icon import.
- **`app/dashboard/layout.tsx`** — confirmed: `ResumeProvider` wraps all children, meaning `useResume()` is available in the Career Coach page without any layout change.
- **`app/dashboard/page.tsx`** — reference for dashboard page style: `"use client"`, `useAuth()`, Tailwind layout, `Link` from next/link.
- **`components/ui/`** — contains `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`. No chat-specific components — the chat UI is built directly with Tailwind today.
- **`app/dashboard/career-coach/`** — does not exist yet. **New today.**
- **`framer-motion ^12.34.3`** is installed — available for message entrance animations.

## Concepts
- **Page-level vs. component-level state:** The Career Coach page owns all state (messages, inputValue, isStreaming, error). This is appropriate because the Coach is a single-page experience — no other component needs to share this state in Sprint 6.
- **Starter prompt chips:** Short, tapable suggestion buttons ("What does my ATS score mean?", "How can I improve my summary?", etc.) that pre-fill the input and submit immediately. This is a common UX pattern in AI chat interfaces that reduces the "blank canvas" anxiety for first-time users.
- **Message render design:** User messages align right with a distinct background; assistant messages align left. Each message is a distinct card with appropriate spacing. This is the "chat bubble" pattern familiar from any messaging app — no novel design work required.
- **Using existing design system:** The page uses the same Tailwind color tokens, border styles, and dark mode classes as the existing dashboard pages. No new design primitives. No Sprint 11 Premium UI work.

## Prerequisites
- Days 1–2 complete: `careerCoachService.ts` exists, `app/api/career-coach/route.ts` exists, build clean.
- Read `components/Sidebar.tsx` fully — understand the `navigationItems` array shape.
- Read `app/dashboard/page.tsx` and `app/dashboard/resume-analyzer/page.tsx` — reference for page structure and Tailwind conventions.

## Setup
No new packages.

## Resources
- `components/Sidebar.tsx` — modified today
- `app/dashboard/page.tsx` — reference pattern
- `lucide-react` icon reference: https://lucide.dev/icons/

## Files to Inspect
- `frontend/components/Sidebar.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/resume-analyzer/page.tsx`
- `frontend/lib/careerCoachService.ts`

## Files to Modify
- `frontend/components/Sidebar.tsx` — add "AI Career Coach" navigation entry

## Files to Create
- `frontend/app/dashboard/career-coach/page.tsx` **[NEW]**

## Architecture Impact
The Career Coach page is a new leaf route under `/dashboard/career-coach`. It automatically inherits `ProtectedRoute` (from `dashboard/layout.tsx`) and `ResumeProvider`. The Sidebar now has 7 navigation entries.

## Data Flow (Day 3 scope — no live API yet)
```
User lands on /dashboard/career-coach
→ Page renders empty state (no messages)
→ User sees starter prompt chips
→ User clicks a chip OR types in input and presses Enter/Send
→ Message is added to local messages state (Day 4 wires the actual API call)
→ For now: only the message state update is implemented — no fetch call
```

## Implementation Plan

### Step 1 — Update `components/Sidebar.tsx`

Add `MessageSquare` to the lucide-react import. Add one entry to `navigationItems`:
```typescript
import {
    LayoutDashboard, FileEdit, Search, Target, Mail, History, Settings, MessageSquare
} from "lucide-react";

const navigationItems = [
    { name: "Dashboard",         href: "/dashboard",                icon: LayoutDashboard },
    { name: "AI Career Coach",   href: "/dashboard/career-coach",  icon: MessageSquare },    // NEW
    { name: "Resume Builder",    href: "/dashboard/builder",        icon: FileEdit },
    { name: "Resume Analyzer",   href: "/dashboard/resume-analyzer",icon: Search },
    { name: "Job Matcher",       href: "/dashboard/job-matcher",    icon: Target },
    { name: "Cover Letter",      href: "/dashboard/cover-letter",   icon: Mail },
    { name: "Resume History",    href: "/dashboard/history",        icon: History },
];
```
Position: second in the list, immediately after Dashboard and before Resume Builder — reflecting the Coach's status as a primary AI feature.

### Step 2 — Create `app/dashboard/career-coach/page.tsx`

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send, RefreshCw, Sparkles, User, Bot } from "lucide-react";
import { ChatMessage } from "@/lib/careerCoachService";

const STARTER_PROMPTS = [
    "What does my ATS score mean?",
    "How can I improve my professional summary?",
    "What skills should I add to strengthen my resume?",
    "How well does my profile match a senior engineer role?",
    "What are the biggest weaknesses in my resume right now?",
    "How can I make my experience section more impactful?",
];

export default function CareerCoachPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleReset = () => {
        setMessages([]);
        setInputValue("");
        setError(null);
    };

    // Stub: Day 4 replaces this with the real streaming send
    const handleSend = async (text?: string) => {
        const content = (text ?? inputValue).trim();
        if (!content || isStreaming) return;

        setInputValue("");
        setError(null);

        const userMessage: ChatMessage = { role: "user", content };
        setMessages(prev => [...prev, userMessage]);

        // Day 4: real API call goes here
        // For now: placeholder assistant message
        setIsStreaming(true);
        await new Promise(r => setTimeout(r, 500)); // simulate delay
        setMessages(prev => [
            ...prev,
            { role: "assistant", content: "Career Coach API will be connected in Day 4." }
        ]);
        setIsStreaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Career Coach</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Powered by your resume & HireLens ATS intelligence
                        </p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        New conversation
                    </button>
                )}
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 custom-scrollbar mb-4">
                {messages.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20">
                            <Sparkles className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Your AI Career Coach
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
                            Ask me anything about your resume, ATS scores, job applications, or career strategy. I use your HireLens resume and ATS analysis as context.
                        </p>
                        {/* Starter prompts */}
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {STARTER_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSend(prompt)}
                                    disabled={isStreaming}
                                    className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Message List */
                    <>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    msg.role === "user"
                                        ? "bg-blue-600"
                                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                }`}>
                                    {msg.role === "user"
                                        ? <User className="w-4 h-4 text-white" />
                                        : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Streaming indicator */}
                        {isStreaming && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                    <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 shrink-0">
                    {error}
                </div>
            )}

            {/* Input Area */}
            <div className="shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-3">
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming}
                        placeholder="Ask your Career Coach anything... (Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 resize-none bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none custom-scrollbar min-h-[44px] max-h-32"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isStreaming}
                        className="shrink-0 w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Send className="w-4 h-4 text-white disabled:text-slate-400" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                    The Coach uses your HireLens resume and ATS analysis as context. Responses are AI-generated coaching, not verified recruiter assessments.
                </p>
            </div>
        </div>
    );
}
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 3: Career Coach Page Shell.

Files being modified/created today:
1. frontend/components/Sidebar.tsx — add one navigation entry
2. frontend/app/dashboard/career-coach/page.tsx [NEW]

CHANGE 1: In frontend/components/Sidebar.tsx:
- Add MessageSquare to the existing lucide-react import.
- Add this entry as the SECOND item in the navigationItems array (after Dashboard, before Resume Builder):
  { name: "AI Career Coach", href: "/dashboard/career-coach", icon: MessageSquare }
- No other changes to Sidebar.tsx.

CHANGE 2: Create frontend/app/dashboard/career-coach/page.tsx as a client component.

Requirements for the page:
- "use client" directive at top.
- Imports: useState, useRef, useEffect from react; useAuth from @/contexts/AuthContext; icons (MessageSquare, Send, RefreshCw, Sparkles, User, Bot) from lucide-react; ChatMessage type from @/lib/careerCoachService.
- Page state: messages (ChatMessage[]), inputValue (string), isStreaming (boolean), error (string|null).
- STARTER_PROMPTS: an array of 6 short career coaching questions.
- Layout: flex column filling h-[calc(100vh-8rem)], max-w-4xl, centered.
- Header: Coach name + icon + "Powered by your resume & HireLens ATS intelligence" subtitle. "New conversation" button (calls handleReset, visible only when messages.length > 0).
- Message area: scrollable, fills available space. Empty state when messages=[]: centered layout with Sparkles icon, heading, description, and the STARTER_PROMPTS as clickable chip buttons that call handleSend(prompt). Message list when messages>0: each message rendered with user avatar (blue circle, User icon, messages align right) or assistant avatar (slate circle, Bot icon, messages align left). Streaming indicator: three bouncing dots while isStreaming=true.
- Auto-scroll to bottom on new messages (useEffect on messages + useRef on a div at the bottom of the message list).
- Error banner: shown above input when error is non-null.
- Input area: fixed at bottom — textarea (rows=2, max-h-32, Shift+Enter for newline, Enter to send) + Send button (blue, disabled when input empty or isStreaming).
- Disclaimer text below input: "The Coach uses your HireLens resume and ATS analysis as context. Responses are AI-generated coaching, not verified recruiter assessments."
- handleSend(text?: string): takes the text param or inputValue, adds a user ChatMessage to messages state, clears inputValue, sets isStreaming=true, then adds a PLACEHOLDER assistant message "Career Coach API will be connected in Day 4." and sets isStreaming=false. (Day 4 replaces this stub with the real streaming API call.)
- handleReset(): clears messages, inputValue, error.
- handleKeyDown: Enter without Shift calls handleSend.
- Use consistent Tailwind classes matching existing dashboard pages (white/slate, dark mode, rounded-xl borders, shadow-sm).
- Do NOT use Sprint 11 design changes. Do NOT import from design libraries not already in the project.

Constraints:
- Only Sidebar.tsx and the new career-coach page are changed.
- No API calls in this page yet — handleSend is a stub.
- No new npm packages.
- ResumeContext and AuthContext are available because this page is under /dashboard/ which already wraps children in both providers.
- Run npm run build and confirm zero TypeScript errors.
- Verify the page renders at /dashboard/career-coach and that the Sidebar shows "AI Career Coach" as a new nav item.
- Report exact diffs for Sidebar.tsx and the new page file.
```

## Testing
```bash
cd frontend
npm run build   # must succeed
npm run dev     # then visit http://localhost:3000/dashboard/career-coach
```

## Manual Verification
1. Sidebar shows "AI Career Coach" nav item with `MessageSquare` icon — both collapsed (icon only) and expanded (icon + label).
2. `/dashboard/career-coach` renders the empty state with header, Sparkles icon, description, and 6 starter prompt chips.
3. Click a starter prompt chip → message appears in the list in "user" bubble (right-aligned) → placeholder assistant response appears.
4. Type in the textarea and press Enter → same flow.
5. Press Shift+Enter → adds newline in textarea without sending.
6. "New conversation" button appears after the first message → clicking it clears everything back to empty state.
7. Page is responsive: on mobile, the layout stacks correctly.
8. Dark mode: page respects the existing dark mode token classes.

## Regression Testing
```bash
npx tsx tests/atsBenchmark.test.ts
npx tsx tests/optimizerSafety.test.ts
```
Both must pass. Sidebar change does not affect any test.

## Expected Behaviour
The `/dashboard/career-coach` page is reachable, visually complete, and allows entering messages. The API stub means responses are placeholder text — the real streaming call is wired in Day 4.

## Failure Cases
- TypeScript error on `ChatMessage` import — confirm `careerCoachService.ts` exports it correctly (Day 1 requirement).
- `MessageSquare` icon not found — it exists in lucide-react 0.575.0 (confirmed in package.json).

## Debugging Guidance
| Symptom | Likely Cause | Fix |
|---|---|---|
| Page returns 404 | Directory or file not in the correct App Router path | Confirm file is at `app/dashboard/career-coach/page.tsx` (not `pages/`) |
| Sidebar active state not applying to Coach page | `usePathname()` compares `pathname === item.href` exactly | Confirm href is `/dashboard/career-coach` with no trailing slash |

## Checklist
- [ ] `Sidebar.tsx` read in full before editing
- [ ] `MessageSquare` added to lucide-react import in Sidebar
- [ ] "AI Career Coach" navigation entry added as second item in navigationItems
- [ ] `app/dashboard/career-coach/page.tsx` created with all required sections
- [ ] Empty state renders correctly with starter prompts
- [ ] Message list renders correctly for user and assistant messages
- [ ] Streaming indicator renders while `isStreaming=true`
- [ ] Reset button appears only when messages exist
- [ ] Input: Enter sends, Shift+Enter newlines
- [ ] Disclaimer text present below input
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Page loads at `/dashboard/career-coach` in dev mode

## Commit Message
```
feat(career-coach): add page shell, empty state, message UI and Sidebar navigation entry
```

## Documentation Updates
- `docs/24_UI_Wireframes.md` — add Career Coach wireframe based on the implemented layout
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 3 entry

## End-of-Day Review
The Career Coach is visible in the navigation and renders a complete, polished page with the correct empty state, starter prompts, and message layout. Clicking starter prompts produces placeholder responses. The full streaming API connection is the next day's work.

## Tomorrow Preview
Day 4 replaces the `handleSend` stub with the real streaming fetch implementation — reading the `ReadableStream` from the Day 2 API route token by token and updating the assistant message in real-time as tokens arrive.
