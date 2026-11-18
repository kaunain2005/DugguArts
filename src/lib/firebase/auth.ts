import { cookies } from "next/headers";
import { getAdminAuth, getAdminFirestore } from "./admin";
import { isAdminEmail } from "./permissions";
import { nodeAuthLogger } from "@/lib/logging";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "__session";
export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME ?? "__csrf";

// 5 days session duration in seconds
const DEFAULT_SESSION_EXPIRY = 60 * 60 * 24 * 5;

export interface SessionUser {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  providers: string[];
  role: "admin" | "customer";
}

export async function createSessionCookie(
  idToken: string,
  expiresIn: number = DEFAULT_SESSION_EXPIRY
): Promise<string> {
  const adminAuth = getAdminAuth();
  return adminAuth.createSessionCookie(idToken, { expiresIn: expiresIn * 1000 });
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  try {
    const adminAuth = getAdminAuth();
    // Second parameter true checks for token revocation
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

    let userData: Record<string, any> = {};
    if (userDoc.exists) {
      userData = userDoc.data() || {};
    }

    // Role check: ONLY based on verified server logic, never client data
    const email = decodedClaims.email || "";
    const isAdmin = isAdminEmail(email);
    const providers =
      userData.providers ||
      (decodedClaims.firebase?.sign_in_provider
        ? [decodedClaims.firebase.sign_in_provider]
        : ["unknown"]);

    return {
      uid: decodedClaims.uid,
      email,
      name: decodedClaims.name || userData.name || null,
      picture: decodedClaims.picture || userData.photoURL || null,
      emailVerified: decodedClaims.email_verified || false,
      isAdmin,
      providers,
      role: isAdmin ? "admin" : "customer",
    };
  } catch (error) {
    nodeAuthLogger.warn("[Auth] Session cookie verification failed or revoked", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return verifySessionCookie(sessionCookie);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (!session.isAdmin) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireCustomer(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.isAdmin) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createSessionAndSetCookie(
  idToken: string
): Promise<{ sessionCookie: string; csrfToken: string; user: SessionUser }> {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminFirestore();

  const decodedToken = await adminAuth.verifyIdToken(idToken);
  if (!decodedToken.email) {
    throw new Error("Email not found in ID token");
  }

  const uid = decodedToken.uid;
  const email = decodedToken.email.toLowerCase();
  const isAdmin = isAdminEmail(email);

  // Set custom user claims so token mirrors the server-side role
  await adminAuth.setCustomUserClaims(uid, {
    role: isAdmin ? "admin" : "customer",
    admin: isAdmin,
  });

  // Sync user record in Firestore
  const userRef = adminDb.collection("users").doc(uid);
  const userDoc = await userRef.get();
  const now = new Date();

  const providerIds = (decodedToken.firebase?.identities
    ? Object.keys(decodedToken.firebase.identities)
    : []
  ).filter(Boolean);
  if (!providerIds.length && decodedToken.firebase?.sign_in_provider) {
    providerIds.push(decodedToken.firebase.sign_in_provider);
  }

  if (!userDoc.exists) {
    await userRef.set({
      uid,
      name: decodedToken.name || null,
      email,
      photoURL: decodedToken.picture || null,
      role: isAdmin ? "admin" : "customer",
      providers: providerIds.length ? providerIds : ["google.com"],
      emailVerified: decodedToken.email_verified || false,
      active: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
  } else {
    const existingData = userDoc.data() || {};
    const mergedProviders = Array.from(
      new Set([...(existingData.providers || []), ...providerIds])
    );
    await userRef.set(
      {
        lastLoginAt: now,
        updatedAt: now,
        name: decodedToken.name || existingData.name || null,
        photoURL: decodedToken.picture || existingData.photoURL || null,
        emailVerified: decodedToken.email_verified ?? existingData.emailVerified,
        providers: mergedProviders,
        role: isAdmin ? "admin" : (existingData.role || "customer"),
      },
      { merge: true }
    );
  }

  const sessionCookie = await createSessionCookie(idToken);
  const csrfToken = generateCSRFToken();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEFAULT_SESSION_EXPIRY,
    path: "/",
  });

  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Accessible to JS so client can send in x-csrf-token header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEFAULT_SESSION_EXPIRY,
    path: "/",
  });

  const sessionUser: SessionUser = {
    uid,
    email,
    name: decodedToken.name || null,
    picture: decodedToken.picture || null,
    emailVerified: decodedToken.email_verified || false,
    isAdmin,
    providers: providerIds,
    role: isAdmin ? "admin" : "customer",
  };

  return { sessionCookie, csrfToken, user: sessionUser };
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

export async function revokeRefreshTokens(uid: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.revokeRefreshTokens(uid);
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return Boolean(storedToken && storedToken === token);
}

export async function getServerSession(): Promise<SessionUser | null> {
  return getSession();
}
