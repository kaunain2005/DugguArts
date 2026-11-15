import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { appsScriptService } from '@/services/apps-script.server';
import { inventorySchema } from '@/lib/validations';
import { createSecureErrorResponse } from '@/lib/security';

async function verifyAdminAuth(request: NextRequest): Promise<{ success: boolean; response?: NextResponse }> {
  const session = await getServerSession(authOptions);

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

function createOptionsResponse(allowedMethods: string = 'GET, PATCH, DELETE, OPTIONS') {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', allowedMethods);
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
    const response = await appsScriptService.adminRequest<{ items: any[]; total: number }>('inventory.list', {
      search: id,
      pageSize: 1,
    });

    const material = response.items?.[0];
    if (!material || material.materialId !== id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Material not found' } },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[GET /api/admin/inventory/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: material,
      message: 'Material retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch material',
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
      'materialName', 'category', 'unit', 'openingStock',
      'currentStock', 'unitCost', 'reorderLevel',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    // Call Apps Script to update material
    const result = await appsScriptService.adminRequest('inventory.update', {
      materialId: id,
      ...updates,
    });

    const duration = Date.now() - startTime;
    console.log(`[PATCH /api/admin/inventory/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Material updated successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update material',
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

    // Call Apps Script to delete material
    const result = await appsScriptService.adminRequest('inventory.delete', {
      materialId: id,
    });

    const duration = Date.now() - startTime;
    console.log(`[DELETE /api/admin/inventory/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete material',
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