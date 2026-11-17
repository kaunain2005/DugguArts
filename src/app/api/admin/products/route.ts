// src/app/api/admin/products/route.ts
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

// Helper to create secure OPTIONS response
function createOptionsResponse() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', process.env.SITE_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * Transform camelCase product data to snake_case for Apps Script
 * Apps Script validation expects snake_case field names
 */
function transformProductToSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};
  
  const camelToSnake: Record<string, string> = {
    categoryId: 'category_id',
    imageUrl: 'image_url',
    galleryUrls: 'gallery_urls',
    stockStatus: 'stock_status',
    // These are already snake_case in the form but ensure they're handled
    name: 'name',
    slug: 'slug',
    description: 'description',
    price: 'price',
    colours: 'colours',
    featured: 'featured',
    active: 'active',
  };

  for (const [key, value] of Object.entries(data)) {
    const snakeKey = camelToSnake[key] || key;
    transformed[snakeKey] = value;
  }

  return transformed;
}

// GET - Read products (read-only middleware)
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stockStatus') || '';
    const featured = searchParams.get('featured');
    const active = searchParams.get('active') || 'true';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await appsScriptService.listProducts({
      page,
      pageSize,
      search,
      category,
      stockStatus,
      featured: featured === 'true',
      active: active === 'true',
      sortBy,
      sortOrder,
    });

    const duration = Date.now() - startTime;
    console.log(`[GET /api/admin/products] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Products retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

// POST - Create product (write middleware with CSRF)
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate with Zod (frontend uses camelCase)
    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Transform to snake_case for Apps Script validation
    const snakeCaseData = transformProductToSnakeCase(validationResult.data);

    // Call Apps Script to create product
    const result = await appsScriptService.adminRequest('products.create', snakeCaseData);

    const duration = Date.now() - startTime;
    console.log(`[POST /api/admin/products] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Product created successfully',
    }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create product',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  const startTime = Date.now();

  try {
    const body = await request.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'productId is required',
          },
        },
        { status: 400 }
      );
    }

    // Transform updates to snake_case for Apps Script
    const snakeCaseUpdates = transformProductToSnakeCase(updates);

    // Call Apps Script to update product
    const result = await appsScriptService.adminRequest('products.update', {
      productId,
      ...snakeCaseUpdates,
    });

    const duration = Date.now() - startTime;
    console.log(`[PATCH /api/admin/products] Completed in ${duration}ms`);

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

export async function OPTIONS() {
  return createOptionsResponse();
}