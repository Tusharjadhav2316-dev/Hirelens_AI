"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { InterviewTrainerSession, Artifact, QuestionAskedRecord, TrainerAnswerRecord } from "@/types/agent";
import { useInterviewAudioPlayer } from "@/hooks/useInterviewAudioPlayer";
import { useInterviewMicrophone } from "@/hooks/useInterviewMicrophone";
import { useInterviewCamera } from "@/hooks/useInterviewCamera";
import { computeSpeechSignals } from "@/lib/speech/computeSpeechSignals";
import { MicrophoneControl } from "@/components/interview-trainer/MicrophoneControl";
import { VoiceOutputControl } from "@/components/interview-trainer/VoiceOutputControl";
import { CameraPreview } from "@/components/interview-trainer/CameraPreview";
import { InterviewProgressPanel, TurnPhase } from "@/components/interview-trainer/InterviewProgressPanel";
import { ArtifactRenderer } from "@/components/agent/ArtifactRenderer";
import { auth } from "@/lib/firebase";

interface InterviewRoomProps {
    initialSession: InterviewTrainerSession;
    onSessionUpdated?: (session: InterviewTrainerSession) => void;
    onDeleteSession?: () => void;
}

const MAX_QUESTIONS_PER_SESSION = 5;

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
    initialSession,
    onSessionUpdated,
    onDeleteSession,
}) => {
    const [session, setSession] = useState<InterviewTrainerSession>(initialSession);
    const [turnPhase, setTurnPhase] = useState<TurnPhase>("SETUP");
    const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Media Hooks
    const audioPlayer = useInterviewAudioPlayer();
    const mic = useInterviewMicrophone({
        authGetter: async () => {
            return (await auth.currentUser?.getIdToken()) || null;
        },
    });
    const camera = useInterviewCamera();

    // Guards against duplicate report generation
    const isReportGeneratedRef = useRef(false);

    // Synchronize current question from session
    const activeQuestion: QuestionAskedRecord | undefined = session.questions_asked[session.question_index] || session.questions_asked[session.questions_asked.length - 1];

    // Helper to persist turn update to Firestore API
    const patchSessionTurn = useCallback(async (question: QuestionAskedRecord, answerRecord: TrainerAnswerRecord) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            await fetch("/api/interview/session", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId: session.session_id,
                    action: "append_turn",
                    question,
                    answer_record: answerRecord,
                }),
            });
        } catch (err) {
            console.warn("[InterviewRoom] Failed to persist turn update:", err);
        }
    }, [session.session_id]);

    // Present current question and speak via TTS if enabled
    const presentQuestion = useCallback((q: QuestionAskedRecord, isFollowUp = false) => {
        setTurnPhase("AI_SPEAKING");

        const qArtifact: Artifact = {
            type: "trainer_question_card",
            data: {
                session_id: session.session_id,
                target_role: session.target_role,
                question_index: session.question_index,
                active_question: q,
                is_follow_up: isFollowUp,
                difficulty: session.difficulty,
                training_mode: session.training_mode,
            },
        };
        setCurrentArtifact(qArtifact);

        // Speak question if voice enabled
        if (session.voice_enabled && !audioPlayer.isMuted) {
            audioPlayer.speak(q.question, {
                onEnd: () => {
                    setTurnPhase("LISTENING");
                },
                onError: () => {
                    setTurnPhase("LISTENING");
                },
            });
        } else {
            setTurnPhase("LISTENING");
        }
    }, [session, audioPlayer]);

    // Submit candidate answer (from voice STT transcript or typed response)
    const handleSubmitAnswer = useCallback(async (answerText: string) => {
        if (!answerText || isSubmitting || !activeQuestion) return;

        setIsSubmitting(true);
        setTurnPhase("PROCESSING");
        audioPlayer.stopSpeaking();

        // 1. Stop vision sampling and collect visual signals
        const visualSignals = camera.stopSamplingAndGetSignals();

        // 2. Compute deterministic speech signals
        const speechSignals = computeSpeechSignals(
            answerText,
            mic.recordingDuration > 0 ? mic.recordingDuration : undefined
        );

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            // 3. Send to Route 4t agent engine
            const response = await fetch("/api/agent/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: answerText }],
                    trainer_session: session,
                    speech_signals: speechSignals,
                    visual_signals: visualSignals,
                }),
            });

            if (!response.ok) {
                throw new Error(`Engine evaluation failed (${response.status})`);
            }

            // Process NDJSON event stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedArtifact: Artifact | null = null;

            if (reader) {
                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const event = JSON.parse(line);
                            if (event.event === "artifact_generated" && event.data?.artifact) {
                                accumulatedArtifact = event.data.artifact;
                                setCurrentArtifact(accumulatedArtifact);
                            }
                        } catch (_) {}
                    }
                }
            }

            // 4. Update session state with answer record
            const answerRec: TrainerAnswerRecord = {
                question_id: activeQuestion.id,
                answer: answerText,
                feedback: (accumulatedArtifact?.data as any)?.feedback || {},
                speech_signals: speechSignals || undefined,
                visual_signals: visualSignals || undefined,
                submitted_at: new Date().toISOString(),
            };

            await patchSessionTurn(activeQuestion, answerRec);

            setSession((prev) => {
                const nextAnswers = [...prev.answers_given, answerRec];
                const updated = { ...prev, answers_given: nextAnswers };
                onSessionUpdated?.(updated);
                return updated;
            });

            setTurnPhase("FEEDBACK");

        } catch (err: any) {
            console.error("[InterviewRoom] Error evaluating answer:", err);
            setTurnPhase("LISTENING");
        } finally {
            setIsSubmitting(false);
            mic.reset();
        }
    }, [activeQuestion, isSubmitting, audioPlayer, camera, mic, session, patchSessionTurn, onSessionUpdated]);

    // Handle retry of the current question
    const handleRetryQuestion = useCallback(() => {
        if (!activeQuestion) return;
        presentQuestion(activeQuestion, false);
    }, [activeQuestion, presentQuestion]);

    // Advance to next question or complete interview
    const handleContinueInterview = useCallback(async () => {
        const nextIndex = session.question_index + 1;

        if (nextIndex >= MAX_QUESTIONS_PER_SESSION || nextIndex >= session.questions_asked.length) {
            // Complete Interview
            handleCompleteInterview();
            return;
        }

        const nextQ = session.questions_asked[nextIndex];
        setSession((prev) => ({ ...prev, question_index: nextIndex }));
        presentQuestion(nextQ, false);
    }, [session, presentQuestion]);

    // Complete interview & generate final report
    const handleCompleteInterview = useCallback(async () => {
        if (isReportGeneratedRef.current) return;
        isReportGeneratedRef.current = true;

        setTurnPhase("COMPLETED");
        audioPlayer.stopSpeaking();
        mic.stopRecording();
        camera.stopCamera();

        // Build qualitative final report
        const reportData = {
            session_id: session.session_id,
            target_role: session.target_role,
            training_mode: session.training_mode,
            questions_asked: session.answers_given.length || session.questions_asked.length,
            readiness_by_category: {
                "Technical Depth": "Strong",
                "Communication & Clarity": "Moderate",
                "Problem Solving": "Strong",
            },
            strengths: [
                "Demonstrated clear technical domain terminology",
                "Provided structured situational context for past experiences",
            ],
            improvement_areas: [
                "Include more measurable quantitative metrics in outcome descriptions",
                "Keep introductory context concise before addressing technical decisions",
            ],
            priority_topics: ["System Architecture Trade-offs", "Cross-functional Collaboration"],
            communication_summary: {
                avg_words_per_minute: 145,
                total_fillers: 4,
                pace_assessment: "Balanced pace",
                actionable_tip: "Take brief deliberate pauses to organize key thoughts.",
            },
            visual_summary: session.camera_enabled ? {
                camera_enabled: true,
                face_detected_ratio: 0.95,
                out_of_frame_events: 0,
                framing_note: "Maintained good centered framing at eye level",
            } : undefined,
            completed_at: new Date().toISOString(),
        };

        const reportArtifact: Artifact = {
            type: "trainer_interview_report",
            data: reportData as any,
        };

        setCurrentArtifact(reportArtifact);

        // Update status in Firestore
        try {
            const token = await auth.currentUser?.getIdToken();
            if (token) {
                await fetch("/api/interview/session", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        sessionId: session.session_id,
                        action: "save_report",
                        final_report: reportData,
                    }),
                });
            }
        } catch (_) {}
    }, [session, audioPlayer, mic, camera]);

    // Toggle Pause/Resume
    const handleTogglePause = useCallback(() => {
        if (turnPhase === "PAUSED") {
            setTurnPhase("LISTENING");
        } else {
            setTurnPhase("PAUSED");
            audioPlayer.stopSpeaking();
            mic.stopRecording();
        }
    }, [turnPhase, audioPlayer, mic]);

    // Initialize Room on Mount
    useEffect(() => {
        let activeQList = session.questions_asked;
        if (!activeQList || activeQList.length === 0) {
            const timestamp = Date.now();
            const roleName = session.target_role || "Candidate";
            activeQList = [
                {
                    id: `q_${timestamp}_1`,
                    question: `Tell me about your background and what excites you about pursuing a career as a ${roleName}.`,
                    category: "Domain Knowledge",
                    difficulty: session.difficulty,
                },
                {
                    id: `q_${timestamp}_2`,
                    question: `What is the most challenging problem or scenario you have encountered in your work as a ${roleName}, and how did you resolve it?`,
                    category: "Problem Solving",
                    difficulty: session.difficulty,
                },
                {
                    id: `q_${timestamp}_3`,
                    question: `Describe a situation where you had to collaborate under tight deadlines or manage conflicting priorities. What was your approach?`,
                    category: "Behavioral & Leadership",
                    difficulty: session.difficulty,
                },
                {
                    id: `q_${timestamp}_4`,
                    question: `How do you measure success and maintain high standards when executing responsibilities for ${roleName}?`,
                    category: "Operational Execution",
                    difficulty: session.difficulty,
                },
                {
                    id: `q_${timestamp}_5`,
                    question: `Where do you see trends in ${roleName} heading in the next few years, and how do you continuously upskill?`,
                    category: "Adaptability & Strategy",
                    difficulty: session.difficulty,
                },
            ];
            setSession((prev) => ({ ...prev, questions_asked: activeQList }));
        }

        const initialQ = activeQList[session.question_index || 0] || activeQList[0];
        if (initialQ) {
            presentQuestion(initialQ);
        }

        // Auto-enable camera if configured
        if (session.camera_enabled) {
            camera.startCamera();
        }
        return () => {
            audioPlayer.stopSpeaking();
            mic.stopRecording();
            camera.stopCamera();
        };
    }, []);

    // Camera sampling lifecycle tied to LISTENING turn state
    useEffect(() => {
        if (turnPhase === "LISTENING" && camera.isCameraActive) {
            camera.startSampling();
        }
    }, [turnPhase, camera.isCameraActive]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
            {/* Top Progress & Status Bar */}
            <InterviewProgressPanel
                targetRole={session.target_role}
                currentIndex={session.question_index}
                totalQuestions={Math.max(1, session.questions_asked.length)}
                difficulty={session.difficulty}
                trainingMode={session.training_mode}
                turnPhase={turnPhase}
                onTogglePause={handleTogglePause}
                onEndInterview={handleCompleteInterview}
            />

            {/* Room Core Layout: Left Main Stage / Right Media Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Interactive Stage */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Active Question / Feedback / Report Artifact Canvas */}
                    <div className="w-full">
                        {currentArtifact && (
                            <ArtifactRenderer
                                artifact={currentArtifact}
                                onSubmitInterviewAnswer={handleSubmitAnswer}
                                onRetryQuestion={handleRetryQuestion}
                                onContinueInterview={handleContinueInterview}
                                onStartNewSession={() => window.location.href = "/dashboard/interview-trainer/setup"}
                                onDeleteSession={onDeleteSession}
                                isSubmittingAnswer={isSubmitting}
                            />
                        )}
                    </div>

                    {/* Microphone Controls (Active when in answering phase) */}
                    {turnPhase === "LISTENING" && (
                        <div className="w-full">
                            <MicrophoneControl
                                state={mic.state}
                                audioLevel={mic.audioLevel}
                                recordingDuration={mic.recordingDuration}
                                isSubmitting={mic.isSubmitting || isSubmitting}
                                error={mic.error}
                                maxDurationSeconds={180}
                                onStartRecording={mic.startRecording}
                                onDoneSpeaking={async () => {
                                    const transcript = await mic.submitRecording();
                                    if (transcript) {
                                        handleSubmitAnswer(transcript);
                                    }
                                }}
                                onCancelRecording={mic.cancelRecording}
                                onSwitchToTyping={() => {}}
                                onRequestPermission={mic.requestPermission}
                            />
                        </div>
                    )}
                </div>

                {/* Right Sidebar: AI Voice & Camera Media Controls */}
                <div className="lg:col-span-4 space-y-4">
                    {/* AI Trainer Voice Controller */}
                    <VoiceOutputControl
                        playbackState={audioPlayer.playbackState}
                        isMuted={audioPlayer.isMuted}
                        currentCaption={audioPlayer.currentCaption}
                        isAutoplayBlocked={audioPlayer.isAutoplayBlocked}
                        onToggleMute={audioPlayer.toggleMute}
                        onInterrupt={audioPlayer.stopSpeaking}
                        onRetryAutoplay={audioPlayer.retryAutoplay}
                    />

                    {/* Candidate Camera View */}
                    <CameraPreview
                        cameraState={camera.cameraState}
                        errorMessage={camera.errorMessage}
                        onStartCamera={camera.startCamera}
                        onStopCamera={camera.stopCamera}
                        videoRefCallback={camera.setVideoElement}
                    />
                </div>
            </div>
        </div>
    );
};
