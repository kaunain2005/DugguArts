import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { getSession, requireAuth } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(session.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User profile not found" } },
        { status: 404 }
      );
    }

    const data = userDoc.data() as Record<string, unknown>;
    const userData = {
      uid: session.uid,
      email: session.email,
      name: data.name,
      photoURL: data.photoURL,
      emailVerified: session.emailVerified,
      isAdmin: session.isAdmin,
      providers: session.providers,
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
      lastLoginAt: getTimestampISO(data, "lastLoginAt"),
    };

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    nodeAuthLogger.error("Get profile error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, photoURL } = body;

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Name must be 2-100 characters" } },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (photoURL !== undefined) {
      updateData.photoURL = photoURL;
    }

    await adminAuth.updateUser(session.uid, {
      displayName: name,
      photoURL: photoURL,
    });

    await adminDb.collection("users").doc(session.uid).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update profile error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}