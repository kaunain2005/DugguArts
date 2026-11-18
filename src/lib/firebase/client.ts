import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.DUGGU_FIREBASE_API_KEY || "",
  authDomain: process.env.DUGGU_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.DUGGU_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.DUGGU_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.DUGGU_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.DUGGU_FIREBASE_APP_ID || "",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

export function getFirebaseFirestore(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}