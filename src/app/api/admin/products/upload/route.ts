import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { appsScriptService } from '@/services/apps-script.server';
import { createSecureErrorResponse } from '@/lib/security';

// Admin-only authorization check
async function verifyAdminAuth(request: NextRequest): Promise<{ success: boolean; response?: NextResponse }> {
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

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || '';

  if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
    return { 
      success: false, 
      response: createSecureErrorResponse({
        code: 'FORBIDDEN',
        message: 'Not authorized',
      }, 403) 
    };
  }

  return { success: true };
}

// POST - Upload product image to Google Drive
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG',
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size exceeds 5MB limit',
          },
        },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Call Apps Script to upload image
    const result = await appsScriptService.adminRequest('products.uploadImage', {
      fileName: file.name,
      mimeType: file.type,
      base64Data,
    });

    const duration = Date.now() - startTime;
    console.log(`[POST /api/admin/products/upload] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload image',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}