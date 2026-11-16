import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { appsScriptService } from '@/services/apps-script.server';
import { productSchema } from '@/lib/validations';
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

function createOptionsResponse() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const { id } = await params;
    const product = await appsScriptService.getProduct({ id });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[GET /api/admin/products/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const { id } = await params;
    const body = await request.json();

    // Partial validation - only validate provided fields
    const allowedFields = [
      'name', 'slug', 'category_id', 'description', 'price',
      'image_url', 'gallery_urls', 'colours', 'stock_status',
      'featured', 'active'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    // If slug is being updated, validate it
    if (updates.slug) {
      const slugValidation = productSchema.shape.slug.safeParse(updates.slug);
      if (!slugValidation.success) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid slug format' } },
          { status: 400 }
        );
      }
    }

    // Call Apps Script to update product
    const result = await appsScriptService.adminRequest('products.update', {
      productId: id,
      ...updates,
    });

    const duration = Date.now() - startTime;
    console.log(`[PATCH /api/admin/products/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Product updated successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const { id } = await params;

    // Call Apps Script to archive product
    const result = await appsScriptService.adminRequest('products.archive', {
      productId: id,
    });

    const duration = Date.now() - startTime;
    console.log(`[DELETE /api/admin/products/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Product archived successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to archive product',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}