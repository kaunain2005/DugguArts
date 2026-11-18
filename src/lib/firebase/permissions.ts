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

/**
 * Retrieves the normalized admin allowlist from ADMIN_EMAILS environment variable.
 * Fails closed by returning an empty array if unset or empty.
 */
export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;
  if (!envEmails || typeof envEmails !== "string") {
    return [];
  }
  return envEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Validates whether an email belongs to the admin allowlist.
 * Fails closed if the email is invalid or ADMIN_EMAILS is empty.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    nodeAuthLogger.warn("[Permissions] ADMIN_EMAILS is empty or unconfigured. Failing closed.");
    return false;
  }

  return adminEmails.includes(normalizedEmail);
}

export async function verifyAdminAccess(email: string): Promise<boolean> {
  return isAdminEmail(email);
}

export async function getUserRole(uid: string): Promise<"admin" | "customer"> {
  const adminAuth = getAdminAuth();
  const userRecord = await adminAuth.getUser(uid);
  const isAdmin = isAdminEmail(userRecord.email || "");
  return isAdmin ? "admin" : "customer";
}

export async function setUserRole(uid: string, role: "admin" | "customer"): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.setCustomUserClaims(uid, {
    role,
    admin: role === "admin",
  });
}
