import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const DAILY_AGENT_REQUEST_LIMIT = 50;

function getAdminDb() {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    const app = getApps().length === 0
        ? initializeApp({ credential: cert(serviceAccount) })
        : getApp();

    return getFirestore(app);
}

export interface UsageCheckResult {
    allowed: boolean;
    count: number;
}

/**
 * Atomically checks and increments the daily agent usage count for a user in Firestore using a transaction.
 * Guarantees that concurrent requests cannot push the count beyond DAILY_AGENT_REQUEST_LIMIT (50).
 * 
 * Boundary logic:
 * - count < 50: allowed=true, counter becomes count + 1
 * - count >= 50: allowed=false, counter remains at existing count (does NOT exceed 50)
 * 
 * Policy:
 * - Fail-open on transient Firestore infrastructure errors to prevent cost soft-limit DB issues from disabling service.
 */
export async function checkAndIncrementUsage(uid: string): Promise<UsageCheckResult> {
    if (!uid || typeof uid !== "string" || !uid.trim()) {
        return { allowed: false, count: 0 };
    }

    try {
        const db = getAdminDb();
        const todayKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const docRef = db.doc(`users/${uid}/agentUsage/${todayKey}`);

        const result = await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(docRef);
            const currentCount = snap.exists ? (snap.data()?.count ?? 0) : 0;

            if (currentCount >= DAILY_AGENT_REQUEST_LIMIT) {
                return { allowed: false, count: currentCount };
            }

            const newCount = currentCount + 1;
            transaction.set(
                docRef,
                {
                    count: newCount,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            return { allowed: true, count: newCount };
        });

        return result;
    } catch (error) {
        // Log safe server-side error without exposing credentials or internal details
        console.error("[agentUsageService] Firestore rate limit transaction error (Failing open per soft-limit policy):", error);
        return { allowed: true, count: 0 };
    }
}
