import { NextRequest, NextResponse } from 'next/server';
import { nodeAuthLogger as authLogger } from '@/lib/logging/node';
import { auth } from '@/auth';
import { appsScriptService } from '@/services/apps-script.server';
import { createSecureErrorResponse } from '@/lib/security';

async function verifyAuth(request: NextRequest): Promise<{ success: boolean; response?: NextResponse }> {
  const session = await auth();

  if (!session?.user?.email) {
    return { 
      success: false, 
      response: createSecureErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      }, 401) 
    };
  }

  return { success: true };
}

function createOptionsResponse() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (!authResult.success) return authResult.response!;

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'User email not found' } },
      { status: 401 }
    );
  }

  try {
    const result = await appsScriptService.adminRequest('wishlist.clear', {
      customerEmail: userEmail,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Wishlist cleared successfully',
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to clear wishlist',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}