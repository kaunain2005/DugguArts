import { NextRequest, NextResponse } from 'next/server';
import { appsScriptService } from '@/services/apps-script.server';
import { customOrderSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validationResult = customOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid request data',
            details: validationResult.error.flatten().fieldErrors,
          } 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Create custom request via Apps Script
    const result = await appsScriptService.createCustomRequest({
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      flowers: data.flowers,
      quantities: data.quantities,
      colours: data.colours,
      bouquetSize: data.bouquetSize,
      wrapping: data.wrapping,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      messageCard: data.messageCard,
      requiredDate: data.requiredDate,
      notes: data.notes,
    });

    const duration = Date.now() - startTime;
    console.log(`[POST /api/custom-requests] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Custom request submitted successfully',
    }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error after ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to submit custom request' 
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}