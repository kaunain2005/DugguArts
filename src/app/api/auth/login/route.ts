import { NextRequest, NextResponse } from "next/server";
import { createSessionAndSetCookie } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "A valid Firebase ID token is required",
          },
        },
        { status: 400 }
      );
    }

    const { user, csrfToken } = await createSessionAndSetCookie(idToken);

    nodeAuthLogger.info("[Auth API] Session established successfully", {
      uid: user.uid,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        csrfToken,
      },
      message: "Login successful",
    });
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Login / session creation error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Failed to establish session",
        },
      },
      { status: 401 }
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
