import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// CSRF token secret (in production, use a strong random secret from env)
const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || 'your-super-secret-csrf-key-change-in-production-min-32-chars'
);

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 24 hours
};

/**
 * Generate a new CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(CSRF_SECRET);
  return token;
}

/**
 * Verify a CSRF token
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, CSRF_SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request (header or cookie)
 */
export function extractCsrfToken(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Check cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Middleware to verify CSRF token on state-changing requests
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null;
  }

  // Skip for API routes that don't need CSRF (e.g., webhooks)
  const pathname = request.nextUrl.pathname;
  const skipPaths = [
    '/api/webhooks/',
    '/api/apps-script', // Public endpoint
  ];
  
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  const token = extractCsrfToken(request);
  
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token is required for this operation',
        },
      },
      { status: 403 }
    );
  }

  const valid = await verifyCsrfToken(token);
  
  if (!valid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or expired CSRF token',
        },
      },
      { status: 403 }
    );
  }

  return null; // CSRF valid
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_NAME, token, CSRF_COOKIE_OPTIONS);
}

/**
 * Get or create CSRF token for a request (useful in server components)
 */
export async function getOrCreateCsrfToken(request: NextRequest): Promise<string> {
  const existingToken = extractCsrfToken(request);
  if (existingToken && await verifyCsrfToken(existingToken)) {
    return existingToken;
  }
  return generateCsrfToken();
}