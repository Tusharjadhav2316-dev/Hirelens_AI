import { NextRequest, NextResponse } from "next/server";
import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { verifyAuth } from "@/lib/verifyAuth";
import {
  InterviewTrainerSession,
  TrainerAnswerRecord,
  QuestionAskedRecord,
  TrainerSessionPatchAction,
} from "@/types/agent";

function getAdminDb() {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  const app =
    getApps().length === 0
      ? initializeApp({ credential: cert(serviceAccount) })
      : getApp();

  return getFirestore(app);
}

const FORBIDDEN_MEDIA_KEYS = ["audio_url", "video_url", "raw_frames", "audio_blob", "video_blob", "frame_data"];

function containsForbiddenMedia(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_MEDIA_KEYS.includes(key.toLowerCase())) {
      return true;
    }
    if (typeof obj[key] === "object" && containsForbiddenMedia(obj[key])) {
      return true;
    }
  }
  return false;
}

// -----------------------------------------------------------------------------
// GET: List recent sessions or retrieve a specific session by sessionId
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const uid = decodedToken.uid;
    const db = getAdminDb();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Retrieve a single session belonging to the authenticated user
      const docRef = db.doc(`users/${uid}/interviewTrainerSessions/${sessionId}`);
      const snap = await docRef.get();

      if (!snap.exists) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ session: snap.data() });
    }

    // List recent sessions for authenticated user
    const colRef = db.collection(`users/${uid}/interviewTrainerSessions`);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const snapshot = await colRef.get();
    const sessions: any[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data());
    });

    // Sort by created_at desc in memory
    sessions.sort((a, b) => {
      const dateA = new Date(a.created_at || a.started_at || 0).getTime();
      const dateB = new Date(b.created_at || b.started_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ sessions: sessions.slice(0, limit) });
  } catch (error: any) {
    const isAuthError = error.message?.includes("Authorization") || error.message?.includes("token");
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// POST: Create a new trainer session
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const uid = decodedToken.uid;
    const db = getAdminDb();

    const body = await req.json();

    // Check forbidden media fields
    if (containsForbiddenMedia(body)) {
      return NextResponse.json(
        { error: "Forbidden media keys detected. Audio and video raw streams cannot be persisted in database." },
        { status: 400 }
      );
    }

    const targetRole = (body.target_role || "").trim();
    if (!targetRole) {
      return NextResponse.json({ error: "target_role is required" }, { status: 400 });
    }

    const sessionId = body.session_id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newSession: InterviewTrainerSession = {
      session_id: sessionId,
      target_role: targetRole,
      interview_type: body.interview_type || "mixed",
      difficulty: body.difficulty || "intermediate",
      training_mode: body.training_mode || "coaching",
      role_intelligence: body.role_intelligence || null,
      question_index: 0,
      questions_asked: body.questions_asked || [],
      answers_given: [],
      voice_enabled: body.voice_enabled !== false,
      camera_enabled: Boolean(body.camera_enabled),
      status: body.status || "setup",
      started_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const docRef = db.doc(`users/${uid}/interviewTrainerSessions/${sessionId}`);
    await docRef.set(newSession);

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error: any) {
    const isAuthError = error.message?.includes("Authorization") || error.message?.includes("token");
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PATCH: Bounded turn updates, status transitions, or final report saving
// -----------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const uid = decodedToken.uid;
    const db = getAdminDb();

    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    const body = await req.json();
    if (!sessionId && (body.sessionId || body.session_id)) {
      sessionId = body.sessionId || body.session_id;
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Check forbidden media fields
    if (containsForbiddenMedia(body)) {
      return NextResponse.json(
        { error: "Forbidden media keys detected. Audio and video raw streams cannot be persisted in database." },
        { status: 400 }
      );
    }

    const action = body.action as string;
    if (!action || !["append_turn", "update_status", "save_report"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid or missing patch action. Permitted actions: 'append_turn', 'update_status', 'save_report'." },
        { status: 400 }
      );
    }

    const docRef = db.doc(`users/${uid}/interviewTrainerSessions/${sessionId}`);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = snap.data() as InterviewTrainerSession;
    const nowIso = new Date().toISOString();

    if (action === "append_turn") {
      const question = body.question as QuestionAskedRecord;
      const answerRecord = body.answer_record as TrainerAnswerRecord;

      if (!question || !answerRecord || !answerRecord.question_id) {
        return NextResponse.json({ error: "Invalid turn payload. question and answer_record are required." }, { status: 400 });
      }

      // 1. Ensure question is recorded in questions_asked
      const existingQIndex = session.questions_asked.findIndex((q) => q.id === question.id);
      if (existingQIndex === -1) {
        session.questions_asked.push(question);
      } else {
        session.questions_asked[existingQIndex] = question;
      }

      // 2. Deduplicate answer on question_id (Idempotency & Retry Handling)
      const existingAnsIndex = session.answers_given.findIndex((a) => a.question_id === answerRecord.question_id);
      if (existingAnsIndex >= 0) {
        // Update existing answer record for this question (e.g. retry)
        session.answers_given[existingAnsIndex] = {
          ...answerRecord,
          submitted_at: nowIso,
        };
      } else {
        // Append new answer record
        session.answers_given.push({
          ...answerRecord,
          submitted_at: nowIso,
        });
        session.question_index += 1;
      }

      session.status = "in_progress";
      session.updated_at = nowIso;

      await docRef.update({
        questions_asked: session.questions_asked,
        answers_given: session.answers_given,
        question_index: session.question_index,
        status: session.status,
        updated_at: nowIso,
      });

      return NextResponse.json({ session });
    } else if (action === "update_status") {
      const newStatus = body.status;
      const validStatuses = ["setup", "in_progress", "paused", "completed", "abandoned"];

      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: `Invalid status: ${newStatus}` }, { status: 400 });
      }

      session.status = newStatus;
      session.updated_at = nowIso;
      if (newStatus === "completed") {
        session.completed_at = nowIso;
      }

      await docRef.update({
        status: newStatus,
        updated_at: nowIso,
        ...(newStatus === "completed" ? { completed_at: nowIso } : {}),
      });

      return NextResponse.json({ session });
    } else if (action === "save_report") {
      const finalReport = body.final_report;
      if (!finalReport || typeof finalReport !== "object") {
        return NextResponse.json({ error: "final_report object is required" }, { status: 400 });
      }

      session.final_report = finalReport;
      session.status = "completed";
      session.completed_at = nowIso;
      session.updated_at = nowIso;

      await docRef.update({
        final_report: finalReport,
        status: "completed",
        completed_at: nowIso,
        updated_at: nowIso,
      });

      return NextResponse.json({ session });
    }

    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
  } catch (error: any) {
    const isAuthError = error.message?.includes("Authorization") || error.message?.includes("token");
    return NextResponse.json(
      { error: error.message || "Failed to update session" },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// DELETE: Delete a session document
// -----------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const uid = decodedToken.uid;
    const db = getAdminDb();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId query parameter is required" }, { status: 400 });
    }

    const docRef = db.doc(`users/${uid}/interviewTrainerSessions/${sessionId}`);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (error: any) {
    const isAuthError = error.message?.includes("Authorization") || error.message?.includes("token");
    return NextResponse.json(
      { error: error.message || "Failed to delete session" },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
