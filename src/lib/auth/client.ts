"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth as useFirebaseAuth, AuthUser } from "@/context/AuthContext";

export { useAuth } from "@/context/AuthContext";

export function useAdminAuth() {
  const { user, isLoading, isAuthenticated, isAdmin, signInWithGoogle, signOut } = useFirebaseAuth();

  return {
    session: user ? { user } : null,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: signInWithGoogle,
    signOut,
  };
}

export function useAdminGuard(redirectTo = "/login") {
  const { isLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace(
        `${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`
      );
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname, redirectTo]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
  };
}
