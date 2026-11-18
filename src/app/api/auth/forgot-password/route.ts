import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Email is required" } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      
      const actionCodeSettings = {
        url: `${process.env.SITE_URL || "http://localhost:3000"}/auth/reset-password`,
        handleCodeInApp: true,
      };

      const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

      if (process.env.NODE_ENV === "development") {
        nodeAuthLogger.info("Password reset link generated", { email, link: resetLink });
      }
    } catch {
      // User doesn't exist, but we don't reveal this for security
    }

    nodeAuthLogger.info("Password reset requested", { email });

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    nodeAuthLogger.error("Forgot password error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process password reset request" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}