import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { createSessionCookie } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, idToken } = body;

    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    let uid: string;

    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
      
      try {
        const userRecord = await adminAuth.getUser(uid);
        
        await adminDb.collection("users").doc(uid).update({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        });
        
        const sessionCookie = await createSessionCookie(idToken);
        
        const userDoc = await adminDb.collection("users").doc(uid).get();
        const userData = userDoc.data();
        
        const isAdmin = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
          .includes((userRecord.email || "").toLowerCase());

        const response = NextResponse.json({
          success: true,
          data: {
            uid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            photoURL: userRecord.photoURL,
            isAdmin,
            providers: userData?.providers || ["google"],
          },
          message: "Login successful",
        });

        const cookieStore = await cookies();
        cookieStore.set("__session", sessionCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 5,
          path: "/",
        });

        return response;
      } catch {
        return NextResponse.json(
          { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
          { status: 404 }
        );
      }
    } else if (email && password) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_IMPLEMENTED", message: "Email/password login should be done client-side" } },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Email and password or ID token required" } },
        { status: 400 }
      );
    }
  } catch (error) {
    nodeAuthLogger.error("Login error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Login failed" } },
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