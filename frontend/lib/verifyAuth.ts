import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Firebase Admin SDK only once
const app = getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();

const adminAuth = getAuth(app);

export async function verifyAuth(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token) {
        throw new Error("Token missing from Authorization header");
    }

    // verifyIdToken will throw an error if the token is expired or invalid
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
}
