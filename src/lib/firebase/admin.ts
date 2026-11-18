import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
} else {
  adminApp = getApp();
}

adminAuth = getAuth(adminApp);
adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };

export function getAdminApp(): App {
  if (!getApps().length) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return getApp();
}

export function getAdminAuth(): Auth {
  const app = getAdminApp();
  return getAuth(app);
}

export function getAdminFirestore(): Firestore {
  const app = getAdminApp();
  return getFirestore(app);
}