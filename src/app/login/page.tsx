"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Flower2,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "signin" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    user,
    isAuthenticated,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Automatically redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = callbackUrl !== "/" ? callbackUrl : user.isAdmin ? "/admin/dashboard" : "/";
      router.replace(destination);
    }
  }, [isAuthenticated, user, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const loggedUser = await signInWithGoogle();
      const destination =
        callbackUrl !== "/"
          ? callbackUrl
          : loggedUser.isAdmin
          ? "/admin/dashboard"
          : "/";
      router.replace(destination);
    } catch (err: any) {
      console.error("[Login Page] Google Sign-In error:", err);
      let msg = "Failed to sign in with Google. Please try again.";
      if (err?.code === "auth/popup-closed-by-user") {
        msg = "Sign in popup closed. Please try again.";
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signin") {
        if (!password) {
          setErrorMessage("Please enter your password.");
          setIsLoading(false);
          return;
        }

        const loggedUser = await signInWithEmail(normalizedEmail, password);
        const destination =
          callbackUrl !== "/"
            ? callbackUrl
            : loggedUser.isAdmin
            ? "/admin/dashboard"
            : "/";
        router.replace(destination);
      } else if (mode === "register") {
        if (!password || password.length < 6) {
          setErrorMessage("Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }

        await registerWithEmail(normalizedEmail, password, name);
        setSuccessMessage(
          "Account created! We've sent a verification email to your address."
        );
        setTimeout(() => {
          const destination = callbackUrl !== "/" ? callbackUrl : "/";
          router.replace(destination);
        }, 1500);
      } else if (mode === "forgot") {
        await sendPasswordReset(normalizedEmail);
        setSuccessMessage(
          "Password reset link sent! Check your email inbox for instructions."
        );
      }
    } catch (err: any) {
      console.error("[Login Page] Auth error:", err);
      let msg = "An error occurred during authentication. Please try again.";

      if (err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (err?.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Try signing in instead.";
      } else if (err?.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err?.code === "auth/invalid-email") {
        msg = "Please provide a valid email address.";
      } else if (err?.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface/50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-heading font-bold text-text mb-4">
            <Flower2 className="w-8 h-8 text-primary" aria-hidden="true" />
            <span>{APP_CONFIG.name}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text">
            {mode === "signin" && "Welcome Back"}
            {mode === "register" && "Create an Account"}
            {mode === "forgot" && "Reset Your Password"}
          </h1>
          <p className="text-text-muted mt-2">
            {mode === "signin" && "Sign in to access your orders, wishlist, or admin dashboard"}
            {mode === "register" && "Join Duggu Arts to track custom orders and save favorites"}
            {mode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Login Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-6 lg:p-8 space-y-6">
            {/* Mode Tabs */}
            {mode !== "forgot" && (
              <div className="flex border-b border-border mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
                    mode === "signin"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-text"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
                    mode === "register"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-text"
                  )}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm"
                role="status"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            {mode !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-border"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 1 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-border w-full" />
                  <span className="bg-surface px-3 text-xs text-text-muted uppercase">or</span>
                  <div className="border-t border-border w-full" />
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "register" && (
                <Input
                  name="name"
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                />
              )}

              <Input
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />

              {mode !== "forgot" && (
                <div className="space-y-1">
                  <Input
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    disabled={isLoading}
                  />

                  {mode === "signin" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === "signin" && "Sign In with Email"}
                    {mode === "register" && "Create Account"}
                    {mode === "forgot" && "Send Reset Link"}
                  </>
                )}
              </Button>

              {mode === "forgot" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-text-muted"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-muted">
          <p>
            By continuing, you agree to our{" "}
            <a href="/policies" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/policies" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
