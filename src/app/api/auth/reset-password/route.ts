import { NextRequest, NextResponse } from "next/server";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oobCode, newPassword } = body;

    if (!oobCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Reset code and new password are required" } },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.DUGGU_FIREBASE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: "CONFIG_ERROR", message: "Firebase API key is not configured" } },
        { status: 500 }
      );
    }

    // Call Firebase Auth Identity Toolkit REST endpoint to confirm password reset
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oobCode,
          newPassword,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error?.message || "Failed to reset password";
      let code = "INVALID_CODE";
      let userMessage = "Invalid or expired reset code. Please request a new one.";

      if (errorMessage.includes("EXPIRED_OOB_CODE")) {
        code = "EXPIRED_CODE";
        userMessage = "Reset code has expired. Please request a new one.";
      } else if (errorMessage.includes("WEAK_PASSWORD")) {
        code = "WEAK_PASSWORD";
        userMessage = "Password is too weak. Please use at least 6 characters.";
      }

      return NextResponse.json(
        { success: false, error: { code, message: userMessage } },
        { status: 400 }
      );
    }

    nodeAuthLogger.info("[Auth API] Password reset completed successfully via REST endpoint", {
      email: result.email,
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Reset password error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to reset password" } },
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
