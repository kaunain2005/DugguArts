import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { edgeAuthLogger, edgeSecurityLogger } from "@/lib/logging/edge";

export function middleware(req: NextRequest) {
  const startTime = Date.now();
  const pathname = req.nextUrl.pathname;
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  // Edge middleware performs preliminary cookie-presence check only.
  // Full cryptographic verification and role checks are performed server-side by Firebase Admin SDK.
  if (pathname.startsWith("/admin")) {
    const sessionCookie = req.cookies.get("__session")?.value;

    if (!sessionCookie) {
      edgeAuthLogger.warn("[Middleware] Unauthenticated admin access attempt (missing session cookie)", {
        path: pathname,
        requestId,
      });

      edgeSecurityLogger.warn("[Middleware] Unauthorized admin access redirect", {
        path: pathname,
        ip: req.headers.get("x-forwarded-for") || "unknown",
        requestId,
      });

      const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
      const redirectResponse = NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
      );

      redirectResponse.headers.set("X-Request-ID", requestId);
      return redirectResponse;
    }

    edgeAuthLogger.debug("[Middleware] Session cookie present for admin route", {
      path: pathname,
      requestId,
    });
  }

  const duration = Date.now() - startTime;
  const response = NextResponse.next();

  response.headers.set("X-Response-Time", `${duration}ms`);
  response.headers.set("X-Request-ID", requestId);

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
