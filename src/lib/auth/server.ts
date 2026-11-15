import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  // Verify email is in admin allowlist (double check)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || "";
  
  if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
    return null;
  }
  
  return session;
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}