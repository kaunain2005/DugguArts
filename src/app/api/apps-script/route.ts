import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const APPS_SCRIPT_SECRET = process.env.GOOGLE_APPS_SCRIPT_SECRET;

interface AppsScriptRequest {
  action: string;
  payload?: Record<string, unknown>;
  requestId?: string;
  secret?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate environment variables
    if (!APPS_SCRIPT_URL || !APPS_SCRIPT_SECRET) {
      console.error('Apps Script configuration missing');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CONFIG_ERROR', 
            message: 'Backend configuration incomplete' 
          } 
        },
        { status: 503 }
      );
    }

    // Parse request body
    let body: AppsScriptRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_JSON', 
            message: 'Invalid JSON payload' 
          } 
        },
        { status: 400 }
      );
    }

    const { action, payload = {}, requestId } = body;

    if (!action) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_ACTION', 
            message: 'Action parameter is required' 
          } 
        },
        { status: 400 }
      );
    }

    // Forward to Google Apps Script
    const appsScriptPayload = {
      action,
      payload,
      requestId: requestId || `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
      secret: APPS_SCRIPT_SECRET,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appsScriptPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Apps Script error (${response.status}):`, errorText);
        
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'APPS_SCRIPT_ERROR', 
              message: `Backend service error: ${response.status}` 
            } 
          },
          { status: 502 }
        );
      }

      const result = await response.json();
      
      // Log performance
      const duration = Date.now() - startTime;
      console.log(`[${appsScriptPayload.requestId}] ${action} completed in ${duration}ms`);

      return NextResponse.json(result);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`Apps Script timeout for action: ${action}`);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'TIMEOUT', 
              message: 'Backend service timeout' 
            } 
          },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API proxy error after ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Internal server error' 
        } 
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
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