import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { isAdminEmail } from "@/lib/firebase/permissions";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Email and password are required" } },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
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

    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(normalizedEmail);
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" } },
        { status: 409 }
      );
    } catch {
      // User doesn't exist, continue
    }

    const isAdmin = isAdminEmail(normalizedEmail);

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: name?.trim() || "",
      emailVerified: false,
    });

    // Set custom user claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: isAdmin ? "admin" : "customer",
      admin: isAdmin,
    });

    // Create user document in Firestore
    const now = new Date();
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: name?.trim() || null,
      email: normalizedEmail,
      photoURL: null,
      role: isAdmin ? "admin" : "customer",
      providers: ["password"],
      emailVerified: false,
      active: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });

    nodeAuthLogger.info("[Auth API] User registered", { uid: userRecord.uid, email: normalizedEmail });

    // Generate email verification link
    let verificationLink = "";
    try {
      const actionCodeSettings = {
        url: `${process.env.SITE_URL || "http://localhost:3000"}/login?verified=true`,
        handleCodeInApp: true,
      };
      verificationLink = await adminAuth.generateEmailVerificationLink(normalizedEmail, actionCodeSettings);
    } catch (linkError) {
      nodeAuthLogger.warn("[Auth API] Could not generate verification link", { error: linkError });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: false,
          verificationLink: process.env.NODE_ENV === "development" ? verificationLink : undefined,
        },
        message: "Registration successful. Please verify your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Registration error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Registration failed" } },
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
