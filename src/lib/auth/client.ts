
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated =
    status === "authenticated" && !!session?.user?.email;

  const user = session?.user;
  // Use type assertion since User type doesn't include isAdmin by default
  const isAdmin = (user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,

    // Same Google login for customers and admins.
    signIn: () => signIn("google", { callbackUrl: "/" }),

    signOut: () => signOut({ callbackUrl: "/" }),
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
  }, [
    isLoading,
    isAuthenticated,
    isAdmin,
    router,
    pathname,
    redirectTo,
  ]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
  };
}

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated =
    status === "authenticated" && !!session?.user?.email;

  const user = session?.user;
  // Use type assertion since User type doesn't include isAdmin by default
  const isAdmin = (user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  const handleSignIn = (callbackUrl = "/") => {
    return signIn("google", { callbackUrl });
  };

  const handleSignOut = (callbackUrl = "/") => {
    return signOut({ callbackUrl });
  };

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
