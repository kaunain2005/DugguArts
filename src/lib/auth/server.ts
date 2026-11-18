import "server-only";

import { getSession, requireAdmin, SessionUser } from "@/lib/firebase/auth";

export async function getAdminSession(): Promise<{ user: SessionUser } | null> {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return null;
  }
  return { user: session };
}

export async function requireAdminSession(): Promise<{ user: SessionUser } | null> {
  try {
    const session = await requireAdmin();
    return { user: session };
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<{ user: SessionUser } | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return { user: session };
}
