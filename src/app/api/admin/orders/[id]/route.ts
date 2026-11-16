import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { appsScriptService } from '@/services/apps-script.server';
import { orderUpdateSchema } from '@/lib/validations';
import { createSecureErrorResponse } from '@/lib/security';

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
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
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
    const order = await appsScriptService.adminRequest<any>('orders.get', { orderId: id });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[GET /api/admin/orders/${id}] Completed in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch order',
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

    // Validate with Zod
    const validationResult = orderUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Call Apps Script to update order
    const result = await appsScriptService.adminRequest('orders.update', {
      orderId: id,
      ...validationResult.data,
    });

    const duration = Date.now() - startTime;
    console.log(`[PATCH /api/admin/orders/${id}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Order updated successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update order',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}