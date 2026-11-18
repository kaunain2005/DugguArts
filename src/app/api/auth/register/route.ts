import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
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
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" } },
        { status: 409 }
      );
    } catch {
      // User doesn't exist, continue
    }

    // Create user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name || "",
      emailVerified: false,
    });

    // Create user document in Firestore
    const now = new Date();
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: name || null,
      email: userRecord.email,
      photoURL: null,
      role: "customer",
      providers: ["password"],
      emailVerified: false,
      active: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });

    nodeAuthLogger.info("User registered", { uid: userRecord.uid, email });

    // Generate email verification link - using REST API approach
    // Note: generateEmailVerificationLink may not be available in all Firebase Admin SDK versions
    let verificationLink = "";
    try {
      const actionCodeSettings = {
        url: `${process.env.SITE_URL || "http://localhost:3000"}/auth/verify-email`,
        handleCodeInApp: true,
      };
      // Use REST API or skip for now
      verificationLink = `${process.env.SITE_URL || "http://localhost:3000"}/auth/verify-email?email=${encodeURIComponent(email)}`;
    } catch (linkError) {
      nodeAuthLogger.warn("Could not generate verification link", { error: linkError });
    }

    // In production, send email via email service
    // For now, return the link (in production, send via email service)
    nodeAuthLogger.info("Email verification link generated", { uid: userRecord.uid, link: verificationLink });

    return NextResponse.json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: false,
        verificationLink: process.env.NODE_ENV === "development" ? verificationLink : undefined,
      },
      message: "Registration successful. Please verify your email.",
    }, { status: 201 });
  } catch (error) {
    nodeAuthLogger.error("Registration error", error);
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