export interface FaceSample {
    timestampMs: number;
    faceDetected: boolean;
    box?: {
        x: number;
        y: number;
        width: number;
        height: number;
        videoWidth: number;
        videoHeight: number;
    };
}

export interface VisualSignals {
    camera_enabled: boolean;
    face_detected_ratio?: number;
    out_of_frame_events: number;
    out_of_frame_total_seconds: number;
    framing_note?: string;
}

/**
 * Deterministically aggregates sampled face detection frames into factual, geometric framing signals.
 * Does NOT infer emotion, attention, nervousness, or personality.
 */
export function computeVisualSignals(
    samples: FaceSample[],
    cameraEnabled: boolean
): VisualSignals {
    if (!cameraEnabled || samples.length === 0) {
        return {
            camera_enabled: false,
            out_of_frame_events: 0,
            out_of_frame_total_seconds: 0,
        };
    }

    const totalSamples = samples.length;
    let detectedCount = 0;
    let outOfFrameEvents = 0;
    let outOfFrameTotalMs = 0;

    let wasInFrame = true;
    let outOfFrameStartMs = 0;

    const validBoxes: Array<NonNullable<FaceSample["box"]>> = [];

    for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        if (s.faceDetected) {
            detectedCount++;
            if (s.box) {
                validBoxes.push(s.box);
            }
            if (!wasInFrame) {
                // Returned to frame
                outOfFrameTotalMs += s.timestampMs - outOfFrameStartMs;
                wasInFrame = true;
            }
        } else {
            if (wasInFrame) {
                // Transitioned out of frame
                outOfFrameEvents++;
                wasInFrame = false;
                outOfFrameStartMs = s.timestampMs;
            }
        }
    }

    if (!wasInFrame && samples.length > 0) {
        outOfFrameTotalMs += samples[samples.length - 1].timestampMs - outOfFrameStartMs;
    }

    const ratio = Math.round((detectedCount / totalSamples) * 100) / 100;
    const outOfFrameSeconds = Math.round((outOfFrameTotalMs / 1000) * 10) / 10;

    // Factual framing assessment based purely on bounding box geometry
    let framingNote = "Good centered framing at eye level";

    if (validBoxes.length > 0) {
        let avgCenterX = 0;
        let avgCenterY = 0;
        let avgWidthRatio = 0;

        for (const b of validBoxes) {
            const centerX = b.x + b.width / 2;
            const centerY = b.y + b.height / 2;
            avgCenterX += centerX / b.videoWidth;
            avgCenterY += centerY / b.videoHeight;
            avgWidthRatio += b.width / b.videoWidth;
        }

        avgCenterX /= validBoxes.length;
        avgCenterY /= validBoxes.length;
        avgWidthRatio /= validBoxes.length;

        if (avgWidthRatio < 0.12) {
            framingNote = "You appear quite far from the camera";
        } else if (avgCenterY < 0.25) {
            framingNote = "Camera appears positioned high / looking down";
        } else if (avgCenterY > 0.65) {
            framingNote = "Camera appears positioned low / looking up";
        } else if (avgCenterX < 0.35) {
            framingNote = "You appear positioned to the left of the frame";
        } else if (avgCenterX > 0.65) {
            framingNote = "You appear positioned to the right of the frame";
        } else {
            framingNote = "Good centered framing at eye level";
        }
    } else if (detectedCount === 0) {
        framingNote = "No face detected in camera frame (check camera angle or lighting)";
    }

    return {
        camera_enabled: true,
        face_detected_ratio: ratio,
        out_of_frame_events: outOfFrameEvents,
        out_of_frame_total_seconds: outOfFrameSeconds,
        framing_note: framingNote,
    };
}
