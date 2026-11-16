"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flower2, Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // Log page load for debugging
  useEffect(() => {
    console.log('[Login Page] Loaded', { 
      callbackUrl, 
      error, 
      errorDescription,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    });
  }, [callbackUrl, error, errorDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    console.log('[Login Page] Initiating signIn', { 
      email: email.trim(), 
      callbackUrl,
      timestamp: new Date().toISOString(),
    });

    try {
      // Initiate Google OAuth sign in
      // In Auth.js v5, signIn redirects so this line won't return normally
      await signIn("google", { 
        callbackUrl,
        // Pass email as login hint to pre-fill Google's email field
        login_hint: email.trim(),
      });
      
      console.log('[Login Page] signIn initiated (should redirect)', { 
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Login Page] signIn error', { 
        error: error.message, 
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      setErrorMessage("Failed to initiate sign in. Please try again.");
      setIsLoading(false);
    }
  };

  // Display error from URL params
  useEffect(() => {
    if (error && !errorMessage) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Failed to sign in with Google. Please try again.",
        OAuthCallback: "OAuth callback failed. Please check your Google Cloud Console configuration.",
        OAuthCreateAccount: "Could not create account. Please contact administrator.",
        EmailCreateAccount: "Could not create account. Please contact administrator.",
        Callback: "Callback failed. Please try again.",
        OAuthAccountNotLinked: "This email is already associated with another account.",
        EmailSignin: "Email sign in failed. Please try again.",
        CredentialsSignin: "Invalid credentials. Please try again.",
        SessionRequired: "Please sign in to continue.",
        AccessDenied: "Access denied. Your email is not authorized for admin access.",
        Default: "An error occurred during sign in. Please try again.",
      };
      
      const message = errorMessages[error] || `${errorMessages.Default} (${error})`;
      setErrorMessage(message);
      
      // Log the OAuth error for debugging
      console.error('[Login Page] OAuth Error from URL', {
        error,
        errorDescription,
        message,
        callbackUrl,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error, errorDescription, errorMessage]);

  const handleDebugToggle = () => setShowDebug(!showDebug);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface/50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Debug Info Toggle */}
        <div className="mb-4 text-right">
          <button
            type="button"
            onClick={handleDebugToggle}
            className="text-xs text-text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className={cn("w-3 h-3", showDebug && "text-green-500")} />
            Debug Info
          </button>
        </div>

        {showDebug && (
          <div className="mb-6 p-3 bg-surface border border-border rounded-lg text-xs text-text-muted overflow-auto max-h-40">
            <pre>{JSON.stringify({
              callbackUrl,
              error,
              errorDescription,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent,
            }, null, 2)}</pre>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-heading font-bold text-text mb-4">
            <Flower2 className="w-8 h-8 text-primary" aria-hidden="true" />
            <span>{APP_CONFIG.name}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text">Welcome Back</h1>
          <p className="text-text-muted mt-2">Sign in with your Google account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-6 lg:p-8 space-y-6">
            {/* Error Message */}
            {(errorMessage || error) && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{errorMessage || error}</span>
              </div>
            )}

            {/* Email Input */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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

                {/* Info */}
                <div className="flex items-center gap-2 text-sm text-text-muted p-3 bg-surface border border-border rounded-lg">
                  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <p>
                    Sign in with your Google account. 
                    <br />
                    <span className="font-medium">Admin access:</span> Automatically granted if your email is in the admin allowlist.
                  </p>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redirecting to Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Help Text */}
            <div className="text-center text-xs text-text-muted">
              <p>Having trouble signing in?</p>
              <p>Make sure you're using a Google account. Contact support if issues persist.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-muted">
          <p>By signing in, you agree to our <a href="/policies" className="underline hover:text-primary">Terms of Service</a> and <a href="/policies" className="underline hover:text-primary">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
}