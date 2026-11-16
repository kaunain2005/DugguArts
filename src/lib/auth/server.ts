
import "server-only";

import { auth } from "@/auth";
import { isAdminEmail } from "@/auth.config";

export async function getAdminSession() {
  return auth();
}

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  if (!isAdminEmail(session.user.email)) {
    return null;
  }

  return session;
}
