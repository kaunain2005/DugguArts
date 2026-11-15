import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { appsScriptService } from '@/services/apps-script.server';
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

function createOptionsResponse(allowedMethods: string = 'GET, OPTIONS') {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', allowedMethods);
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    // Return dashboard summary
    const [products, orders, requests, reviews, inventory, customers] = await Promise.all([
      appsScriptService.listProducts({ pageSize: 1, active: true }),
      appsScriptService.adminRequest<{ items: any[]; total: number }>('orders.list', { pageSize: 10 }),
      appsScriptService.adminRequest<{ items: any[]; total: number }>('requests.list', { pageSize: 10 }),
      appsScriptService.listReviews({ approvedOnly: true, pageSize: 1 }),
      appsScriptService.adminRequest<{ items: any[]; total: number }>('inventory.list', { lowStockOnly: true, pageSize: 5 }),
      appsScriptService.adminRequest<{ items: any[]; total: number }>('customers.list', { pageSize: 1 }),
    ]);

    const stats = {
      totalProducts: products.total,
      activeProducts: products.total,
      totalOrders: orders.total || 0,
      newEnquiries: orders.items?.filter((o: any) => o.orderStatus === 'new').length || 0,
      pendingRequests: requests.items?.filter((r: any) => r.requestStatus === 'pending').length || 0,
      pendingReviews: reviews.total || 0,
      lowStockMaterials: inventory.items?.length || 0,
      totalCustomers: customers.total || 0,
    };

    const duration = Date.now() - startTime;
    console.log(`[GET /api/admin] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}