import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
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

    const adminAuth = getAdminAuth();

    await adminAuth.verifyPasswordResetCode(oobCode);
    await adminAuth.confirmPasswordReset(oobCode, newPassword);

    nodeAuthLogger.info("Password reset completed");

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    nodeAuthLogger.error("Reset password error", error);
    
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return NextResponse.json(
          { success: false, error: { code: "EXPIRED_CODE", message: "Reset code has expired. Please request a new one." } },
          { status: 400 }
        );
      }
      if (error.message.includes("invalid")) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_CODE", message: "Invalid or expired reset code" } },
          { status: 400 }
        );
      }
    }

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