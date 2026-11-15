import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export interface AdminSession {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || '';

  if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to access admin panel' } },
      { status: 403 }
    );
  }

  return {
    user: {
      id: (session.user as any).id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
  };
}

export function createAdminErrorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function createAdminSuccessResponse<T>(data: T, message = 'Operation successful'): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}