import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Current password and new password are required" } },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "New password must be at least 6 characters" } },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "New password must be different from current password" } },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const userRecord = await adminAuth.getUser(session.uid);
    const hasPasswordProvider = userRecord.providerData.some((p: any) => p.providerId === "password");

    if (!hasPasswordProvider) {
      return NextResponse.json(
        { success: false, error: { code: "NO_PASSWORD", message: "No password set for this account. Use account linking to set a password." } },
        { status: 400 }
      );
    }

    await adminAuth.updateUser(session.uid, {
      password: newPassword,
    });

    await adminAuth.revokeRefreshTokens(session.uid);

    await adminDb.collection("users").doc(session.uid).update({
      passwordUpdatedAt: new Date(),
      updatedAt: new Date(),
    });

    nodeAuthLogger.info("Password changed", { uid: session.uid });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    nodeAuthLogger.error("Change password error", error);
    
    if (error instanceof Error && error.message.includes("INVALID_PASSWORD")) {
      return NextResponse.json(
        { success: false, error: { code: "WRONG_PASSWORD", message: "Current password is incorrect" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to change password" } },
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