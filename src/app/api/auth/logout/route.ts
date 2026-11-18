import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nodeAuthLogger } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("__session");
    cookieStore.delete("__csrf");

    nodeAuthLogger.info("User logged out");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Logout error", error);
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