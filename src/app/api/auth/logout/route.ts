import { NextRequest, NextResponse } from "next/server";
import { getSession, clearSessionCookie, revokeRefreshTokens } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(_request: NextRequest) {
  try {
    const session = await getSession();

    if (session?.uid) {
      try {
        await revokeRefreshTokens(session.uid);
      } catch (e) {
        nodeAuthLogger.warn("[Auth API] Could not revoke refresh tokens on logout", { error: e });
      }
    }

    await clearSessionCookie();

    nodeAuthLogger.info("[Auth API] User logged out successfully", {
      uid: session?.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("[Auth API] Logout error", error);
    await clearSessionCookie();
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Logout failed" } },
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
