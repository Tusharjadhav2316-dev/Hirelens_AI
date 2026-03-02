import { db, storage, auth } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { deleteUser as deleteFirebaseAuthUser } from "firebase/auth";

export interface UserProfile {
    fullName: string;
    defaultTemplate: string;
    themePreference: "light" | "dark" | "system";
    avatarUrl: string;
    updatedAt: any;
}

/**
 * Gets or initializes a user's profile document.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;

    try {
        const docRef = doc(db, "users", userId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return snapshot.data() as UserProfile;
        }

        // Initialize default profile
        const defaultProfile: UserProfile = {
            fullName: "New User",
            defaultTemplate: "professional",
            themePreference: "system",
            avatarUrl: "",
            updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, defaultProfile);
        return defaultProfile;

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

/**
 * Updates properties on the user profile.
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (!userId) return;

    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}

/**
 * Uploads an avatar image and returns the base64 URL.
 * We compress the image on the client side using Canvas to ensure it fits well within Firestore's 1MB document limit.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
    if (!userId || !file) throw new Error("Missing user or file.");

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                const MAX_SIZE = 256;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                } else {
                    return reject(new Error("Failed to get 2d context"));
                }

                // Compress to jpeg at 70% quality
                const base64String = canvas.toDataURL("image/jpeg", 0.7);

                try {
                    await updateUserProfile(userId, { avatarUrl: base64String });
                    resolve(base64String);
                } catch (error) {
                    console.error("Error saving avatar to Firestore:", error);
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error("Failed to parse image for compression."));
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error("Failed to read file target."));
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            reject(error);
        };
    });
}

/**
 * Completely purges a user account and all associated data.
 * Sequence: Delete History -> Delete DB Profile -> Delete Auth Account
 */
export async function deleteUserAccount(userId: string) {
    if (!userId || !auth.currentUser) throw new Error("Unauthorized");

    try {
        // 1. Delete all history subcollection documents
        const historyRef = collection(db, `users/${userId}/history`);
        const historyDocs = await getDocs(historyRef);

        const deletePromises = historyDocs.docs.map(historyDoc => deleteDoc(historyDoc.ref));
        await Promise.all(deletePromises);

        // 2. Delete main profile document
        await deleteDoc(doc(db, "users", userId));

        // 3. Delete Firebase Auth user
        await deleteFirebaseAuthUser(auth.currentUser);

    } catch (error) {
        console.error("Error fully deleting user account:", error);
        throw error;
    }
}
