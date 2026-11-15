"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user?.email;
  const user = session?.user;

  // Check if user email is in admin allowlist
  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: () => signIn("google", { callbackUrl: "/admin" }),
    signOut: () => signOut({ callbackUrl: "/admin-login" }),
  };
}

export function useAdminGuard(redirectTo = "/admin-login") {
  const { isLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname, redirectTo]);

  return { isLoading, isAuthenticated, isAdmin };
}

// Helper to check admin email on client
function isAdminEmail(email: string): boolean {
  // This should match the server-side logic
  // In production, this would come from an API or env var exposed to client
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  return adminEmails.length === 0 || adminEmails.includes(email.toLowerCase());
}