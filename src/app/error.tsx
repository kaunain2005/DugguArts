"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 bg-error/10 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-error" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text mb-4">Something went wrong</h1>
        <p className="text-text-muted mb-8">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}