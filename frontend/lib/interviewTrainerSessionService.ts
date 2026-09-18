import { auth } from "@/lib/firebase";
import {
  InterviewTrainerSession,
  RoleIntelligenceData,
  QuestionAskedRecord,
  TrainerAnswerRecord,
} from "@/types/agent";

async function getAuthHeader(explicitToken?: string): Promise<Record<string, string>> {
  let token = explicitToken;
  if (!token && typeof window !== "undefined" && auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }
  if (!token) {
    throw new Error("User must be authenticated to perform session operations.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface CreateSessionParams {
  target_role: string;
  interview_type?: "hr" | "behavioral" | "technical" | "mixed" | "role_specific";
  difficulty?: "beginner" | "intermediate" | "advanced";
  training_mode?: "coaching" | "realistic_mock";
  role_intelligence?: RoleIntelligenceData | null;
  questions_asked?: QuestionAskedRecord[];
  voice_enabled?: boolean;
  camera_enabled?: boolean;
}

/**
 * Creates a new Interview Trainer session stored in Firestore.
 */
export async function createTrainerSession(
  params: CreateSessionParams,
  explicitToken?: string
): Promise<InterviewTrainerSession> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch("/api/interview/session", {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create session (${res.status})`);
  }

  const data = await res.json();
  return data.session;
}

/**
 * Retrieves a single session by sessionId for the authenticated user.
 */
export async function getTrainerSession(
  sessionId: string,
  explicitToken?: string
): Promise<InterviewTrainerSession> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch session (${res.status})`);
  }

  const data = await res.json();
  return data.session;
}

/**
 * Lists recent trainer sessions for the authenticated user.
 */
export async function listTrainerSessions(
  limit: number = 20,
  explicitToken?: string
): Promise<InterviewTrainerSession[]> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?limit=${limit}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to list sessions (${res.status})`);
  }

  const data = await res.json();
  return data.sessions || [];
}

/**
 * Appends or updates a turn (question and answer record) with deduplication by question_id.
 */
export async function appendTurn(
  sessionId: string,
  question: QuestionAskedRecord,
  answerRecord: TrainerAnswerRecord,
  explicitToken?: string
): Promise<InterviewTrainerSession> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      action: "append_turn",
      question,
      answer_record: answerRecord,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to record turn (${res.status})`);
  }

  const data = await res.json();
  return data.session;
}

/**
 * Updates session lifecycle status (e.g. in_progress, paused, completed, abandoned).
 */
export async function updateSessionStatus(
  sessionId: string,
  status: "setup" | "in_progress" | "paused" | "completed" | "abandoned",
  explicitToken?: string
): Promise<InterviewTrainerSession> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      action: "update_status",
      status,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update status (${res.status})`);
  }

  const data = await res.json();
  return data.session;
}

/**
 * Saves the final qualitative interview report to the session.
 */
export async function saveSessionReport(
  sessionId: string,
  finalReport: Record<string, any>,
  explicitToken?: string
): Promise<InterviewTrainerSession> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      action: "save_report",
      final_report: finalReport,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to save report (${res.status})`);
  }

  const data = await res.json();
  return data.session;
}

/**
 * Deletes a session document.
 */
export async function deleteTrainerSession(
  sessionId: string,
  explicitToken?: string
): Promise<boolean> {
  const headers = await getAuthHeader(explicitToken);

  const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete session (${res.status})`);
  }

  return true;
}
