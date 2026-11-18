import { cookies } from "next/headers";
import { getAdminAuth, getAdminFirestore } from "./admin";
import { nodeAuthLogger } from "@/lib/logging";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "__session";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME ?? "__csrf";

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

export interface SessionData {
  user: SessionUser;
  expiresAt: number;
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!ADMIN_EMAILS.length) return false;
  return ADMIN_EMAILS.includes(normalizedEmail);
}

export async function createSessionCookie(idToken: string, expiresIn: number = 60 * 60 * 24 * 5): Promise<string> {
  const adminAuth = getAdminAuth();
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: expiresIn * 1000 });
  return sessionCookie;
}

export async function verifySessionCookie(sessionCookie: string): Promise<SessionUser | null> {
  try {
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
    
    let userData: any = {};
    if (userDoc.exists) {
      userData = userDoc.data();
    }
    
    const isAdmin = isAdminEmail(decodedClaims.email || "");
    const providers = userData.providers || [decodedClaims.firebase?.sign_in_provider || "unknown"];
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || "",
      name: decodedClaims.name || userData.name || null,
      picture: decodedClaims.picture || userData.photoURL || null,
      emailVerified: decodedClaims.email_verified || false,
      isAdmin,
      providers,
      role: isAdmin ? "admin" : "customer",
    };
  } catch (error) {
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

export async function createSessionAndSetCookie(idToken: string): Promise<{ sessionCookie: string; csrfToken: string }> {
  const adminAuth = getAdminAuth();
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  
  if (!decodedToken.email) {
    throw new Error("Email not found in ID token");
  }
  
  const sessionCookie = await createSessionCookie(idToken);
  const csrfToken = generateCSRFToken();
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 5, // 5 days
    path: "/",
  });
  
  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 5,
    path: "/",
  });
  
  return { sessionCookie, csrfToken };
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return storedToken === token;
}

export async function getServerSession(): Promise<SessionUser | null> {
  return getSession();
}