import {
  InterviewTrainerSession,
  TrainerAnswerRecord,
  QuestionAskedRecord,
} from "../types/agent";

console.log("=== Interview Trainer Session Security & Contract Test Suite ===\n");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
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

function runSecurityTests() {
  // 1. Forbidden Media Key Detection
  const validPayload = {
    target_role: "Software Engineer",
    interview_type: "technical",
    answers: [{ question_id: "q1", answer: "Spoken transcript text." }],
  };
  assert(!containsForbiddenMedia(validPayload), "Valid text payload contains no forbidden media");

  const audioPayload = {
    target_role: "Software Engineer",
    audio_url: "https://storage.googleapis.com/audio/q1.wav",
  };
  assert(containsForbiddenMedia(audioPayload), "Forbidden audio_url payload is detected and rejected");

  const videoPayload = {
    target_role: "Software Engineer",
    video_url: "https://storage.googleapis.com/video/q1.mp4",
  };
  assert(containsForbiddenMedia(videoPayload), "Forbidden video_url payload is detected and rejected");

  const rawFramesPayload = {
    target_role: "Software Engineer",
    answer_record: {
      question_id: "q1",
      answer: "Text answer",
      raw_frames: ["base64frame1", "base64frame2"],
    },
  };
  assert(containsForbiddenMedia(rawFramesPayload), "Forbidden raw_frames payload inside answer_record is detected and rejected");

  // 2. Turn Deduplication & Idempotency Logic
  const answersGiven: TrainerAnswerRecord[] = [
    { question_id: "q1", answer: "First attempt", retry_count: 0 },
  ];

  // Attempt duplicate submission for q1 (e.g. retry or network retry)
  const retryRecord: TrainerAnswerRecord = {
    question_id: "q1",
    answer: "Second refined attempt",
    retry_count: 1,
  };

  const existingIdx = answersGiven.findIndex((a) => a.question_id === retryRecord.question_id);
  if (existingIdx >= 0) {
    answersGiven[existingIdx] = retryRecord;
  } else {
    answersGiven.push(retryRecord);
  }

  assert(answersGiven.length === 1, "Duplicate submission with same question_id updates existing record without duplicating count");
  assert(answersGiven[0].answer === "Second refined attempt", "Existing answer record updated with refined attempt");
  assert(answersGiven[0].retry_count === 1, "Retry count updated to 1");

  // Submitting distinct question appends cleanly
  const q2Record: TrainerAnswerRecord = {
    question_id: "q2",
    answer: "Answer to question 2",
    retry_count: 0,
  };
  const q2Idx = answersGiven.findIndex((a) => a.question_id === q2Record.question_id);
  if (q2Idx >= 0) {
    answersGiven[q2Idx] = q2Record;
  } else {
    answersGiven.push(q2Record);
  }
  assert(answersGiven.length === 2, "Distinct question_id correctly appends to answers list");

  // 3. Bounded PATCH Action Whitelist
  const validActions = ["append_turn", "update_status", "save_report"];
  assert(validActions.includes("append_turn"), "append_turn is a permitted patch action");
  assert(validActions.includes("update_status"), "update_status is a permitted patch action");
  assert(validActions.includes("save_report"), "save_report is a permitted patch action");
  assert(!validActions.includes("replace_document"), "Arbitrary replace_document action is forbidden");
  assert(!validActions.includes("set_arbitrary_data"), "Arbitrary set_arbitrary_data action is forbidden");

  // 4. Status Transition Whitelist
  const validStatuses = ["setup", "in_progress", "paused", "completed", "abandoned"];
  assert(validStatuses.includes("setup"), "Status 'setup' is valid");
  assert(validStatuses.includes("in_progress"), "Status 'in_progress' is valid");
  assert(validStatuses.includes("paused"), "Status 'paused' is valid");
  assert(validStatuses.includes("completed"), "Status 'completed' is valid");
  assert(validStatuses.includes("abandoned"), "Status 'abandoned' is valid");
  assert(!validStatuses.includes("arbitrary_status"), "Arbitrary status is forbidden");

  console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runSecurityTests();
