import { computeVisualSignals, type FaceSample } from "../lib/vision/computeVisualSignals.ts";

console.log("=== Geometric Visual Framing Signals Contract Tests ===\n");

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

function runVisualSignalsTests() {
    // 1. Disabled Camera Returns Disabled Contract
    const disabledSignals = computeVisualSignals([], false);
    assert(disabledSignals.camera_enabled === false, "Camera disabled returns camera_enabled=false");
    assert(disabledSignals.out_of_frame_events === 0, "No out of frame events when camera disabled");
    assert(disabledSignals.framing_note === undefined, "No framing note generated when camera is disabled");

    // 2. High Ratio & Centered Framing
    const centeredBox = { x: 160, y: 120, width: 320, height: 240, videoWidth: 640, videoHeight: 480 };
    const centeredSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: true, box: centeredBox },
        { timestampMs: 2000, faceDetected: true, box: centeredBox },
        { timestampMs: 3000, faceDetected: true, box: centeredBox },
        { timestampMs: 4000, faceDetected: true, box: centeredBox },
    ];

    const signals1 = computeVisualSignals(centeredSamples, true);
    assert(signals1.camera_enabled === true, "Camera enabled is true");
    assert(signals1.face_detected_ratio === 1.0, "Face detected ratio is 1.0 (100%)");
    assert(signals1.out_of_frame_events === 0, "Zero out of frame events for steady candidate");
    assert(signals1.framing_note === "Good centered framing at eye level", "Identifies good centered framing at eye level");

    // 3. Out of Frame Events & Duration Calculation
    const movingSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: true, box: centeredBox },
        { timestampMs: 2000, faceDetected: false }, // Left frame (event 1)
        { timestampMs: 3000, faceDetected: false },
        { timestampMs: 4000, faceDetected: true, box: centeredBox },  // Returned (2s gap)
        { timestampMs: 5000, faceDetected: false }, // Left frame (event 2)
        { timestampMs: 6000, faceDetected: true, box: centeredBox },  // Returned (1s gap)
    ];

    const signals2 = computeVisualSignals(movingSamples, true);
    assert(signals2.out_of_frame_events === 2, "Accurately counts 2 distinct out-of-frame transitions");
    assert(signals2.face_detected_ratio === 0.5, "Ratio is 3/6 = 0.5");
    assert(signals2.out_of_frame_total_seconds === 3.0, "Calculates 3.0 total seconds spent out of frame");

    // 4. Low Camera Angle Detection
    const lowBox = { x: 160, y: 350, width: 320, height: 100, videoWidth: 640, videoHeight: 480 };
    const lowAngleSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: true, box: lowBox },
        { timestampMs: 2000, faceDetected: true, box: lowBox },
    ];
    const signals3 = computeVisualSignals(lowAngleSamples, true);
    assert(signals3.framing_note === "Camera appears positioned low / looking up", "Identifies low camera angle positioning");

    // 5. High Camera Angle Detection
    const highBox = { x: 160, y: 40, width: 320, height: 100, videoWidth: 640, videoHeight: 480 };
    const highAngleSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: true, box: highBox },
        { timestampMs: 2000, faceDetected: true, box: highBox },
    ];
    const signals4 = computeVisualSignals(highAngleSamples, true);
    assert(signals4.framing_note === "Camera appears positioned high / looking down", "Identifies high camera angle positioning");

    // 6. Far Distance Detection
    const farBox = { x: 280, y: 200, width: 50, height: 50, videoWidth: 640, videoHeight: 480 };
    const farSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: true, box: farBox },
        { timestampMs: 2000, faceDetected: true, box: farBox },
    ];
    const signals5 = computeVisualSignals(farSamples, true);
    assert(signals5.framing_note === "You appear quite far from the camera", "Identifies far distance framing");

    // 7. No Face Detected
    const emptyDetectionSamples: FaceSample[] = [
        { timestampMs: 1000, faceDetected: false },
        { timestampMs: 2000, faceDetected: false },
    ];
    const signals6 = computeVisualSignals(emptyDetectionSamples, true);
    assert(signals6.face_detected_ratio === 0.0, "Face detected ratio is 0.0");
    assert(signals6.framing_note?.includes("No face detected"), "Provides informative lighting/angle suggestion without inference");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runVisualSignalsTests();
