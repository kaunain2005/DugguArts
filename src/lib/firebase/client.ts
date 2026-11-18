import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.DUGGU_FIREBASE_API_KEY ||
    "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.DUGGU_FIREBASE_AUTH_DOMAIN ||
    "",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.DUGGU_FIREBASE_PROJECT_ID ||
    "",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.DUGGU_FIREBASE_STORAGE_BUCKET ||
    "",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.DUGGU_FIREBASE_MESSAGING_SENDER_ID ||
    "",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.DUGGU_FIREBASE_APP_ID ||
    "",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.DUGGU_FIREBASE_MEASUREMENT_ID ||
    "",
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) {
    return cachedApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0];
    return cachedApp;
  }

  cachedApp = initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    const app = getFirebaseApp();
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

export function getFirebaseFirestore(): Firestore {
  if (!cachedDb) {
    const app = getFirebaseApp();
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}

// Proxied direct exports for client-side components
export const app = new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    if (typeof window === "undefined") return undefined;
    return (getFirebaseApp() as any)[prop];
  },
});

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (typeof window === "undefined") return undefined;
    return (getFirebaseAuth() as any)[prop];
  },
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (typeof window === "undefined") return undefined;
    return (getFirebaseFirestore() as any)[prop];
  },
});
