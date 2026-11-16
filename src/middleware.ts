
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig, isAdminEmail } from "./auth.config";
import {
  edgeAuthLogger,
  edgeSecurityLogger,
} from "@/lib/logging/edge";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const startTime = Date.now();
  const pathname = req.nextUrl.pathname;

  const email = req.auth?.user?.email?.trim().toLowerCase() ?? "";
  const isLoggedIn = !!email;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdmin = isLoggedIn && isAdminEmail(email);

  const requestId =
    req.headers.get("x-request-id") || crypto.randomUUID();

  edgeAuthLogger.debug("Middleware route check", {
    path: pathname,
    isLoggedIn,
    isAdmin,
    requestId,
  });

  if (isAdminRoute) {
    if (!isLoggedIn) {
      edgeAuthLogger.warn("Unauthenticated admin access attempt", {
        path: pathname,
        requestId,
      });

      edgeSecurityLogger.warn("Unauthorized admin access attempt", {
        path: pathname,
        ip: req.headers.get("x-forwarded-for") || "unknown",
        requestId,
      });

      const callbackUrl = encodeURIComponent(
        pathname + req.nextUrl.search
      );

      const response = NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
      );

      response.headers.set("X-Request-ID", requestId);
      return response;
    }

    if (!isAdmin) {
      edgeAuthLogger.warn("Non-admin attempted admin access", {
        path: pathname,
        email,
        requestId,
      });

      edgeSecurityLogger.warn("Admin access denied", {
        path: pathname,
        email,
        requestId,
      });

      const response = NextResponse.redirect(
        new URL("/?error=unauthorized", req.url)
      );

      response.headers.set("X-Request-ID", requestId);
      return response;
    }

    edgeAuthLogger.info("Admin access granted", {
      email,
      path: pathname,
      requestId,
    });
  }

  const duration = Date.now() - startTime;
  const response = NextResponse.next();

  response.headers.set("X-Response-Time", `${duration}ms`);
  response.headers.set("X-Request-ID", requestId);

  return response;
});

export const config = {
  matcher: ["/admin/:path*"],
};
