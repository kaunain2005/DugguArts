
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/auth.config";

export interface AdminSession {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  };
}

export async function verifyAdminSession(
  _request: NextRequest
): Promise<AdminSession | NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
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

  if (!isAdminEmail(session.user.email)) {
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

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      isAdmin: true,
    },
  };
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
