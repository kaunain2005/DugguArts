import { handlers } from "@/auth";
import { nodeAuthLogger as authLogger } from "@/lib/logging/node";
import { NextRequest } from "next/server";

// Wrapper to add request logging
const loggedHandlers = {
  GET: async (request: NextRequest) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    authLogger.info('Auth API: GET request', {
      path: new URL(request.url).pathname,
      searchParams: Object.fromEntries(new URL(request.url).searchParams),
      requestId,
    }, request);
    
    const startTime = Date.now();
    try {
      const response = await handlers.GET(request);
      const duration = Date.now() - startTime;
      
      authLogger.info('Auth API: GET response', {
        status: response.status,
        duration,
        requestId,
      });
      
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      authLogger.error('Auth API: GET error', {
        error: err.message,
        stack: err.stack,
        duration,
        requestId,
      }, request);
      
      throw error;
    }
  },
  
  POST: async (request: NextRequest) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    authLogger.info('Auth API: POST request', {
      path: new URL(request.url).pathname,
      contentType: request.headers.get('content-type'),
      requestId,
    }, request);
    
    const startTime = Date.now();
    try {
      const response = await handlers.POST(request);
      const duration = Date.now() - startTime;
      
      authLogger.info('Auth API: POST response', {
        status: response.status,
        duration,
        requestId,
      });
      
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      authLogger.error('Auth API: POST error', {
        error: err.message,
        stack: err.stack,
        duration,
        requestId,
      }, request);
      
      throw error;
    }
  },
};

export const { GET, POST } = loggedHandlers;