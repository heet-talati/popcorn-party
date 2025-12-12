/**
 * Firebase client initialization (Auth + Firestore)
 *
 * Environment variables required (in `.env.local`):
 * - `NEXT_PUBLIC_FIREBASE_API_KEY`
 * - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
 * - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
 * - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
 * - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
 * - `NEXT_PUBLIC_FIREBASE_APP_ID`
 *
 * All are client-exposed by design for Firebase Web SDK.
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration for the client app.
 * @type {{
 *  apiKey: string | undefined,
 *  authDomain: string | undefined,
 *  projectId: string | undefined,
 *  storageBucket: string | undefined,
 *  messagingSenderId: string | undefined,
 *  appId: string | undefined
 * }}
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize (or reuse) the Firebase app instance.
 * @returns {import('firebase/app').FirebaseApp}
 */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance.
 * @type {import('firebase/auth').Auth}
 */
export const auth = getAuth(app);
/**
 * Firestore database instance.
 * @type {import('firebase/firestore').Firestore}
 */
export const db = getFirestore(app);
