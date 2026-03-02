import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Prevent re-initialization during hot reload
const firebaseConfig = {
    apiKey: "AIzaSyBnYAOJlCE-RIu60vG43nqO_GTEF_aw290",
    authDomain: "hirelens-34590.firebaseapp.com",
    projectId: "hirelens-34590",
    storageBucket: "hirelens-34590.firebasestorage.app",
    messagingSenderId: "279978660119",
    appId: "1:279978660119:web:60d0ee209e952c2892e752",
    measurementId: "G-T05NJTEVNS",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);