import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export type ActivityType = "resume" | "ats-analysis" | "job-match" | "cover-letter";

export interface ActivityHistoryItem {
    id: string;
    type: ActivityType;
    title: string;
    metadata: {
        score?: number;
        company?: string;
        jobTitle?: string;
    };
    contentSnapshot?: string;
    structuredData?: any; // For full resume objects
    createdAt: any; // Firestore Timestamp
    expiresAt: any; // Firestore Timestamp
}

/**
 * Saves an activity snapshot to the user's history collection with a 7-day expiration.
 */
export async function saveActivityHistory(
    userId: string,
    type: ActivityType,
    title: string,
    metadata: ActivityHistoryItem['metadata'] = {},
    contentSnapshot?: string,
    structuredData?: any
) {
    if (!userId) return null;

    try {
        const historyRef = collection(db, `users/${userId}/history`);
        const newDocRef = doc(historyRef);

        // Calculate expiration correctly on the server side (7 days from now)
        const expiresAtDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const data = {
            id: newDocRef.id,
            type,
            title,
            metadata,
            contentSnapshot: contentSnapshot || "",
            structuredData: structuredData || null,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAtDate),
        };

        await setDoc(newDocRef, data);
        return newDocRef.id;
    } catch (error) {
        console.error("Failed to save activity history:", error);
        return null;
    }
}

/**
 * Retrieves unexpired recent history for a user, sorted by newest first.
 */
export async function getRecentHistory(userId: string): Promise<ActivityHistoryItem[]> {
    if (!userId) return [];

    try {
        const historyRef = collection(db, `users/${userId}/history`);

        // Strict query: only load items where expiresAt is > right now
        const q = query(
            historyRef,
            where("expiresAt", ">", Timestamp.now()),
            orderBy("expiresAt", "asc") // Required due to compound index rule, we will sort memory
        );

        const snapshot = await getDocs(q);

        const results = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as ActivityHistoryItem[];

        // Sort descending by creation date (newest first)
        return results.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });

    } catch (error) {
        console.error("Failed to fetch activity history:", error);
        return [];
    }
}

/**
 * Retrieves a single history item by ID.
 */
export async function getHistoryItem(userId: string, historyId: string): Promise<ActivityHistoryItem | null> {
    if (!userId || !historyId) return null;
    try {
        const { getDoc } = await import("firebase/firestore");
        const docRef = doc(db, `users/${userId}/history/${historyId}`);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return { ...snapshot.data(), id: snapshot.id } as ActivityHistoryItem;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch history item:", error);
        return null;
    }
}

/**
 * Deletes a specific history item
 */
export async function deleteHistoryItem(userId: string, historyId: string) {
    if (!userId || !historyId) return;
    try {
        await deleteDoc(doc(db, `users/${userId}/history/${historyId}`));
    } catch (error) {
        console.error("Failed to delete history item:", error);
        throw error;
    }
}
