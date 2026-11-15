import { NextRequest, NextResponse } from 'next/server';
import { appsScriptService } from '@/services/apps-script.server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const featured = searchParams.get('featured');
    
    const result = await appsScriptService.listReviews({
      productId,
      page,
      pageSize,
      featured: featured === 'true',
      approvedOnly: true,
    });

    const duration = Date.now() - startTime;
    console.log(`[GET /api/reviews] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Reviews retrieved successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to fetch reviews' 
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