import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, authRateLimiter, adminWriteRateLimiter } from './rate-limiter';
import { csrfProtection, extractCsrfToken, generateCsrfToken, setCsrfCookie } from './csrf';
import { applySecurityHeaders, createSecureResponse, createSecureErrorResponse } from './headers';
import { sanitizeObject, safeJsonParse } from './validation';
import { logAuditEvent, auditMiddleware, extractClientInfo, AuditAction } from './audit';

interface SecurityMiddlewareOptions {
  rateLimit?: 'default' | 'auth' | 'admin-write' | false;
  csrf?: boolean;
  audit?: boolean;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * Comprehensive security middleware for API routes
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const {
    rateLimit = 'default',
    csrf = true,
    audit = true,
    requireAuth = false,
    adminOnly = false,
  } = options;

  return async function securityMiddleware(
    request: NextRequest,
    handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const context: SecurityContext = {
      request,
      clientInfo: extractClientInfo(request),
      csrfToken: null,
      user: null,
    };

    try {
      // 1. Apply rate limiting
      if (rateLimit !== false) {
        const limiter = rateLimit === 'auth' ? authRateLimiter 
          : rateLimit === 'admin-write' ? adminWriteRateLimiter 
          : rateLimiter;
        
        const rateLimitResponse = limiter(request);
        if (rateLimitResponse) {
          await logAuditEvent('RATE_LIMIT_EXCEEDED', request, {
            success: false,
            errorMessage: 'Rate limit exceeded',
            metadata: { path: request.nextUrl.pathname },
          });
          return applySecurityHeaders(rateLimitResponse);
        }
      }

      // 2. CSRF protection for state-changing methods
      if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const csrfResponse = await csrfProtection(request);
        if (csrfResponse) {
          await logAuditEvent('CSRF_VIOLATION', request, {
            success: false,
            errorMessage: 'Invalid CSRF token',
            metadata: { path: request.nextUrl.pathname },
          });
          return applySecurityHeaders(csrfResponse);
        }
      }

      // 3. Authentication check
      if (requireAuth || adminOnly) {
        // This will be checked in individual routes via getServerSession
        // But we can do a basic check here
        const authHeader = request.headers.get('authorization');
        const sessionCookie = request.cookies.get('next-auth.session-token') 
          || request.cookies.get('__session');
        
        if (!authHeader && !sessionCookie) {
          const response = createSecureErrorResponse({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          }, 401);
          
          await logAuditEvent('UNAUTHORIZED_ACCESS', request, {
            success: false,
            errorMessage: 'Missing authentication',
            metadata: { path: request.nextUrl.pathname },
          });
          
          return applySecurityHeaders(response);
        }
      }

      // 4. Admin authorization check
      if (adminOnly) {
        // This will be validated in the route handler via getServerSession
        // We just note it in context
        context.requiresAdmin = true;
      }

      // 5. Audit logging
      if (audit) {
        auditMiddleware(request);
      }

      // 6. Generate CSRF token for response if needed
      if (csrf && ['GET', 'HEAD'].includes(request.method)) {
        context.csrfToken = await generateCsrfToken();
      }

      // 7. Call the actual handler
      const response = await handler(request, context);

      // 8. Apply security headers to response
      const securedResponse = applySecurityHeaders(response);

      // 9. Set CSRF cookie if token was generated
      if (context.csrfToken) {
        setCsrfCookie(securedResponse, context.csrfToken);
      }

      // 10. Add timing header
      securedResponse.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      return securedResponse;

    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Log the error
      await logAuditEvent('INTERNAL_ERROR', request, {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: { path: request.nextUrl.pathname },
      });

      // Return sanitized error response
      const errorResponse = createSecureErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      }, 500);
      
      return applySecurityHeaders(errorResponse);
    }
  };
}

interface SecurityContext {
  request: NextRequest;
  clientInfo: { ip: string; userAgent: string };
  csrfToken: string | null;
  user: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
  requiresAdmin?: boolean;
}

// Pre-configured middleware instances
export const publicApiMiddleware = createSecurityMiddleware({
  rateLimit: 'default',
  csrf: false, // CSRF not needed for public read APIs
  audit: true,
});

export const authApiMiddleware = createSecurityMiddleware({
  rateLimit: 'auth',
  csrf: true,
  audit: true,
});

export const adminApiMiddleware = createSecurityMiddleware({
  rateLimit: 'admin-write',
  csrf: true,
  audit: true,
  adminOnly: true,
});

export const adminReadApiMiddleware = createSecurityMiddleware({
  rateLimit: 'default',
  csrf: false,
  audit: true,
  adminOnly: true,
});