"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  onIdTokenChanged,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export interface AuthUser {
  uid: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  providers: string[];
  role: "admin" | "customer";
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  linkPasswordCredential: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Syncs the client-side Firebase ID token with the Next.js server session cookie
  const syncServerSession = useCallback(async (token: string): Promise<AuthUser> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || "Failed to establish server session");
    }

    const verifiedUser: AuthUser = result.data.user;
    setUser(verifiedUser);
    return verifiedUser;
  }, []);

  // Sync session on auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onIdTokenChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (currentFirebaseUser) {
        try {
          const token = await currentFirebaseUser.getIdToken();
          await syncServerSession(token);
        } catch (err) {
          console.error("[AuthContext] Session sync error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncServerSession]);

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(auth, provider);
      const token = await credential.user.getIdToken(true);
      const authenticatedUser = await syncServerSession(token);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, [syncServerSession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      setIsLoading(true);
      try {
        const auth = getFirebaseAuth();
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const token = await credential.user.getIdToken(true);
        const authenticatedUser = await syncServerSession(token);
        return authenticatedUser;
      } finally {
        setIsLoading(false);
      }
    },
    [syncServerSession]
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, name: string): Promise<void> => {
      setIsLoading(true);
      try {
        const auth = getFirebaseAuth();
        const normalizedEmail = email.trim().toLowerCase();
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }

        try {
          await sendEmailVerification(credential.user);
        } catch (verifErr) {
          console.warn("[AuthContext] Could not send client email verification", verifErr);
        }

        const token = await credential.user.getIdToken(true);
        await syncServerSession(token);
      } finally {
        setIsLoading(false);
      }
    },
    [syncServerSession]
  );

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email.trim().toLowerCase(), {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    });
  }, []);

  const linkPasswordCredential = useCallback(
    async (password: string): Promise<void> => {
      const auth = getFirebaseAuth();
      const current = auth.currentUser;
      if (!current || !current.email) {
        throw new Error("You must be signed in with a Google account to link a password");
      }

      const cred = EmailAuthProvider.credential(current.email, password);
      await linkWithCredential(current, cred);

      // Notify server route to update Firestore providers array
      const res = await fetch("/api/auth/link-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, linked: true }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update account linking records");
      }

      // Refresh ID token and session
      const token = await current.getIdToken(true);
      await syncServerSession(token);
    },
    [syncServerSession]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken(true);
      await syncServerSession(token);
    }
  }, [syncServerSession]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.isAdmin),
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    sendPasswordReset,
    linkPasswordCredential,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
