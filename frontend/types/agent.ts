import { ATSAnalysisResult } from "@/lib/atsAnalyzer";
import { JobMatchResult } from "@/lib/jdMatcher";
import { Resume } from "@/types/resume";

export type EventType =
  | "agent_started"
  | "agent_thinking"
  | "tool_started"
  | "tool_completed"
  | "artifact_generated"
  | "agent_completed"
  | "agent_error";

export interface AgentEventPayload {
  event: EventType;
  timestamp: string;
  agent_name?: string;
  tool_name?: string;
  data?: Record<string, any>;
  error?: string;
}

export interface AgentAction {
  tool: string;
  tool_input: Record<string, any>;
  log?: string;
}

export type AttachmentCategory = "resume" | "job_description" | "cover_letter" | "document";

export interface AgentAttachment {
  id: string;
  name: string;
  mimeType: string;
  category: AttachmentCategory;
  text?: string;
  extractedText?: string;
  size?: number;
  uploadedAt: number;
}

export interface AttachmentContext {
  id: string;
  name: string;
  mimeType: string;
  extractedText: string;
  category?: AttachmentCategory;
  size: number;
}

export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentStreamPayload {
  messages: AgentChatMessage[];
  resume?: Resume;
  attachments?: AttachmentContext[];
  interview_session?: InterviewSessionState;
}

// 1. ATS Score Card Payload
export interface ATSScoreArtifactData {
  result: ATSAnalysisResult | any;
  explanation?: string;
}

// 2. Resume Diff Payload
export interface ResumeDiffArtifactData {
  section: string;
  itemId?: string;
  before: string;
  after: string;
  rationale: string;
}

// 3. Job Listing Item & Search Result Payload
export interface NormalizedJobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  url?: string;
  provider?: string;
}

export interface JobResultArtifactData {
  status?: "configured" | "not_configured";
  listings?: NormalizedJobListing[];
  message?: string;
}

// 4. Skill Gap Payload (reuses canonical JobMatchResult)
export interface SkillGapArtifactData extends Partial<JobMatchResult> {
  targetRole?: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchScore: number;
}

// 5. Cover Letter Payload
export interface CoverLetterArtifactData {
  content: string;
  jobTitle?: string;
  companyName?: string;
}

// 6. Interview Question Item & Payload
export interface InterviewQuestionItem {
  id: string;
  question: string;
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  keyTips?: string[];
  isActive?: boolean;
  questionIndex?: number;
  totalQuestions?: number;
}

export interface InterviewQuestionArtifactData {
  questions: InterviewQuestionItem[];
  session?: InterviewSessionState;
  active_question?: InterviewQuestionItem | QuestionAskedRecord;
  latest_feedback?: Record<string, any>;
  is_follow_up?: boolean;
}

export interface QuestionAskedRecord {
  id: string;
  question: string;
  category?: string;
  difficulty?: string;
}

export interface AnswerGivenRecord {
  questionId: string;
  answer: string;
  feedback?: Record<string, any>;
}

export interface InterviewSessionState {
  sessionId: string;
  interviewType: "hr" | "behavioral" | "technical" | "mixed";
  targetRole: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionIndex: number;
  questionsAsked: QuestionAskedRecord[];
  answersGiven: AnswerGivenRecord[];
  status: "in_progress" | "completed";
}

export interface InterviewFeedbackArtifactData {
  question: string;
  answer: string;
  clarity: string;
  structure: string;
  specificity: string;
  technical_depth: string;
  strengths: string[];
  improvements: string[];
  suggested_answer_direction: string;
}

export interface InterviewReportArtifactData {
  interview_type: string;
  target_role: string;
  questions_asked: number;
  readiness_by_category: Record<string, "Strong" | "Moderate" | "Needs Improvement">;
  strengths: string[];
  improvement_areas: string[];
  priority_topics: string[];
  note?: string;
}

// 7. Task Progress Payload
export interface TaskProgressArtifactData {
  label: string;
  percent: number;
}

// 8. Structured Resume Artifact Payload
export interface ResumeArtifactData {
  resume: Resume;
  targetRole?: string;
  summaryNote?: string;
}

// Closed Discriminated Union for Artifacts (10 Types)
export type ATSScoreArtifact = { id?: string; title?: string; type: "ats_score_card"; data: ATSScoreArtifactData };
export type ResumeDiffArtifact = { id?: string; title?: string; type: "resume_diff"; data: ResumeDiffArtifactData };
export type JobResultArtifact = { id?: string; title?: string; type: "job_result_card"; data: JobResultArtifactData };
export type SkillGapArtifact = { id?: string; title?: string; type: "skill_gap_card"; data: SkillGapArtifactData };
export type CoverLetterArtifact = { id?: string; title?: string; type: "cover_letter_preview"; data: CoverLetterArtifactData };
export type InterviewQuestionArtifact = { id?: string; title?: string; type: "interview_question_card"; data: InterviewQuestionArtifactData };
export type InterviewFeedbackArtifact = { id?: string; title?: string; type: "interview_feedback_card"; data: InterviewFeedbackArtifactData };
export type InterviewReportArtifact = { id?: string; title?: string; type: "interview_report_card"; data: InterviewReportArtifactData };
export type TaskProgressArtifact = { id?: string; title?: string; type: "task_progress"; data: TaskProgressArtifactData };
export type ResumeArtifact = { id?: string; title?: string; type: "resume_preview"; data: ResumeArtifactData };

export type Artifact =
  | ATSScoreArtifact
  | ResumeDiffArtifact
  | JobResultArtifact
  | SkillGapArtifact
  | CoverLetterArtifact
  | InterviewQuestionArtifact
  | InterviewFeedbackArtifact
  | InterviewReportArtifact
  | TaskProgressArtifact
  | ResumeArtifact;

export interface AgentResponse {
  output: string;
  artifacts?: Artifact[];
  actions_taken?: AgentAction[];
}
