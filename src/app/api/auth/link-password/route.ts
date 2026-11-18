import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { password, linked } = body;

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const userRecord = await adminAuth.getUser(session.uid);
    const existingProviders = userRecord.providerData.map((p) => p.providerId);
    const hasPassword = existingProviders.includes("password");

    // Case 1: Password provided directly to server to attach to Google account
    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Password must be at least 6 characters",
            },
          },
          { status: 400 }
        );
      }

      await adminAuth.updateUser(session.uid, { password });
    } else if (!linked && !hasPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password is required to link credentials",
          },
        },
        { status: 400 }
      );
    }

    // Refresh provider list after update
    const updatedUserRecord = await adminAuth.getUser(session.uid);
    const updatedProviders = Array.from(
      new Set([
        ...session.providers,
        ...updatedUserRecord.providerData.map((p) => p.providerId),
        "password",
      ])
    );

    const now = new Date();
    await adminDb.collection("users").doc(session.uid).set(
      {
        providers: updatedProviders,
        passwordSetAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    nodeAuthLogger.info("[Auth API] Password credential linked to account", {
      uid: session.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Password linked successfully. You can now log in with either Google or email and password.",
    });
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Link password error", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to link password",
        },
      },
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
