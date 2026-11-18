import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Password is required" } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const userRecord = await adminAuth.getUser(session.uid);
    const hasPasswordProvider = userRecord.providerData.some((p: any) => p.providerId === "password");

    if (hasPasswordProvider) {
      return NextResponse.json(
        { success: false, error: { code: "PASSWORD_EXISTS", message: "Account already has a password. Use password change instead." } },
        { status: 400 }
      );
    }

    await adminAuth.updateUser(session.uid, {
      password: password,
    });

    await adminDb.collection("users").doc(session.uid).update({
      providers: [...session.providers, "password"],
      passwordSetAt: new Date(),
      updatedAt: new Date(),
    });

    nodeAuthLogger.info("Password linked to Google account", { uid: session.uid });

    return NextResponse.json({
      success: true,
      message: "Password linked successfully. You can now log in with email and password.",
    });
  } catch (error) {
    nodeAuthLogger.error("Link password error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to link password" } },
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