import { NextRequest, NextResponse } from 'next/server';
import { appsScriptService } from '@/services/apps-script.server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stockStatus') || '';
    const featured = searchParams.get('featured');
    const active = searchParams.get('active') || 'true';
    const sortBy = searchParams.get('sortBy') || 'featured';
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
    console.log(`[GET /api/products] Completed in ${duration}ms`);

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
          message: error instanceof Error ? error.message : 'Failed to fetch products' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}