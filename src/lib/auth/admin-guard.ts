import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, SessionUser } from "@/lib/firebase/auth";

export interface AdminSession {
  user: SessionUser;
}

export async function verifyAdminSession(
  _request?: NextRequest
): Promise<AdminSession | NextResponse> {
  try {
    const user = await requireAdmin();
    return { user };
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to access admin panel",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      },
      { status: 401 }
    );
  }
}

export function createAdminErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export function createAdminSuccessResponse<T>(
  data: T,
  message = "Operation successful"
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}
