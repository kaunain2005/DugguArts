import { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'require-corp',
  
  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
};

// Content Security Policy
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com wss:",
  "frame-src 'self' https://www.google.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP
  response.headers.set('Content-Security-Policy', CSP_POLICY);

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Remove server header
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Create a secure response with security headers
 */
export function createSecureResponse(
  body: unknown,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  const response = NextResponse.json(body, { status: options.status || 200 });
  
  // Apply security headers
  applySecurityHeaders(response);
  
  // Add custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Create a secure error response (sanitized)
 */
export function createSecureErrorResponse(
  error: { code: string; message: string; details?: unknown },
  status: number = 500
): NextResponse {
  // Sanitize error - only include safe fields
  const sanitizedError = {
    code: error.code,
    message: error.message,
    // Don't include details in production
    ...(process.env.NODE_ENV !== 'production' && error.details ? { details: error.details } : {}),
  };

  return createSecureResponse(
    { success: false, error: sanitizedError },
    { status }
  );
}

/**
 * Create a secure success response
 */
export function createSecureSuccessResponse<T>(
  data: T,
  message: string = 'Operation successful',
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  return createSecureResponse(
    { success: true, data, message },
    options
  );
}