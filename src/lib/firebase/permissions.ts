import { getAdminAuth, getAdminFirestore } from "./admin";
import { nodeAuthLogger } from "@/lib/logging";

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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!ADMIN_EMAILS.length) return false;
  return ADMIN_EMAILS.includes(normalizedEmail);
}

export async function verifyAdminAccess(email: string): Promise<boolean> {
  if (!email) return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!ADMIN_EMAILS.length) {
    nodeAuthLogger.error("ADMIN_EMAILS is not configured");
    return false;
  }
  
  return ADMIN_EMAILS.includes(normalizedEmail);
}

export async function getUserRole(uid: string): Promise<"admin" | "customer"> {
  const adminAuth = getAdminAuth();
  const userRecord = await adminAuth.getUser(uid);
  const isAdmin = isAdminEmail(userRecord.email || "");
  return isAdmin ? "admin" : "customer";
}

export async function setUserRole(uid: string, role: "admin" | "customer"): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.setCustomUserClaims(uid, { role });
}

export async function verifySessionCookie(sessionCookie: string): Promise<{ uid: string; email: string; isAdmin: boolean } | null> {
  try {
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const isAdmin = await verifyAdminAccess(decodedClaims.email || "");
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || "",
      isAdmin,
    };
  } catch {
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresIn: number = 60 * 60 * 24 * 5): Promise<string> {
  const adminAuth = getAdminAuth();
  return adminAuth.createSessionCookie(idToken, { expiresIn: expiresIn * 1000 });
}

export async function revokeRefreshTokens(uid: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.revokeRefreshTokens(uid);
}

export async function getUserByEmail(email: string) {
  const adminAuth = getAdminAuth();
  try {
    return await adminAuth.getUserByEmail(email);
  } catch {
    return null;
  }
}

export async function createUserWithEmailPassword(email: string, password: string, displayName?: string) {
  const adminAuth = getAdminAuth();
  return adminAuth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });
}

export async function updateUserPassword(uid: string, newPassword: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.updateUser(uid, { password: newPassword });
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const adminAuth = getAdminAuth();
  // Use REST API or skip for now
  const actionCodeSettings = {
    url: `${process.env.SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    handleCodeInApp: true,
  };
  await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
}

export async function linkProviderToUser(uid: string, providerId: string, credential: any): Promise<void> {
  // Linking providers should be done client-side with Firebase Client SDK
  // This is a placeholder for server-side linking if needed
  const adminAuth = getAdminAuth();
  // Note: provider linking is typically done client-side
  // Server-side linking requires custom token approach
  await adminAuth.updateUser(uid, {});
}