import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminAuth: ReturnType<typeof getAuth> | null = null;

function getAdminAuth() {
    if (!adminAuth) {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        };

        const app = getApps().length === 0
            ? initializeApp({ credential: cert(serviceAccount) })
            : getApp();

        adminAuth = getAuth(app);
    }
    return adminAuth;
}

export async function verifyAuth(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token) {
        throw new Error("Token missing from Authorization header");
    }

    const auth = getAdminAuth();
    // verifyIdToken will throw an error if the token is expired or invalid
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
}
