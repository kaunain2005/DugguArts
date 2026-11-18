import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function getServiceAccount() {
  if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
    try {
      const config =
        typeof process.env.FIREBASE_ADMIN_SDK_CONFIG === "string"
          ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
          : process.env.FIREBASE_ADMIN_SDK_CONFIG;

      return {
        projectId: config.project_id || config.projectId || process.env.FIREBASE_PROJECT_ID,
        clientEmail: config.client_email || config.clientEmail || process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (config.private_key || config.privateKey || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n"),
      };
    } catch (e) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_ADMIN_SDK_CONFIG:", e);
    }
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.DUGGU_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

let cachedAdminApp: App | null = null;
let cachedAdminAuth: Auth | null = null;
let cachedAdminDb: Firestore | null = null;

export function getAdminApp(): App {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedAdminApp = existingApps[0];
    return cachedAdminApp;
  }

  const serviceAccount = getServiceAccount();

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    cachedAdminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  } else {
    // Fallback for build phase or unconfigured local environments
    console.warn("[Firebase Admin] Initializing without full service account credentials.");
    cachedAdminApp = initializeApp({
      projectId: serviceAccount.projectId || "duggu-arts",
    });
  }

  return cachedAdminApp;
}

export function getAdminAuth(): Auth {
  if (!cachedAdminAuth) {
    const app = getAdminApp();
    cachedAdminAuth = getAuth(app);
  }
  return cachedAdminAuth;
}

export function getAdminFirestore(): Firestore {
  if (!cachedAdminDb) {
    const app = getAdminApp();
    cachedAdminDb = getFirestore(app);
  }
  return cachedAdminDb;
}

// Proxied direct exports for backward compatibility across existing routes
export const adminApp = new Proxy({} as App, {
  get(_target, prop) {
    return (getAdminApp() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    return (getAdminAuth() as any)[prop];
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getAdminFirestore() as any)[prop];
  },
});
