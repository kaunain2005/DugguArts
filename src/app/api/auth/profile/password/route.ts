import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));
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

    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.DUGGU_FIREBASE_API_KEY;

    // Secure reauthentication: verify current password before making sensitive change
    if (apiKey) {
      const reauthResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.email,
            password: currentPassword,
            returnSecureToken: true,
          }),
        }
      );

      if (!reauthResponse.ok) {
        return NextResponse.json(
          { success: false, error: { code: "WRONG_PASSWORD", message: "Current password is incorrect" } },
          { status: 400 }
        );
      }
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    await adminAuth.updateUser(session.uid, {
      password: newPassword,
    });

    // Revoke all existing tokens so other sessions must re-login
    await adminAuth.revokeRefreshTokens(session.uid);

    await adminDb.collection("users").doc(session.uid).set(
      {
        passwordUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    nodeAuthLogger.info("[Auth API] Password changed and existing sessions revoked", {
      uid: session.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Change password error", error);
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
