import { NextRequest } from 'next/server';

export type AuditAction = 
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'PASSWORD_CHANGE' | 'EMAIL_CHANGE' | 'ROLE_CHANGE'
  | 'ORDER_CREATE' | 'ORDER_UPDATE' | 'ORDER_CANCEL'
  | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE'
  | 'SETTINGS_UPDATE' | 'EXPORT_DATA' | 'IMPORT_DATA'
  | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT_EXCEEDED' | 'CSRF_VIOLATION'
  | 'INTERNAL_ERROR';

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip: string;
  userAgent: string;
  resource?: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

// In-memory store for development (use database in production)
const auditLogs: AuditLogEntry[] = [];
const MAX_AUDIT_LOGS = 10000;

/**
 * Extract client info from request
 */
export function extractClientInfo(request: NextRequest): { ip: string; userAgent: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || request.headers.get('cf-connecting-ip')
    || 'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ip, userAgent };
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  action: AuditAction,
  request: NextRequest,
  options: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    resource?: string;
    resourceId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(request);
  
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId: options.userId,
    userEmail: options.userEmail,
    userRole: options.userRole,
    ip,
    userAgent,
    resource: options.resource,
    resourceId: options.resourceId,
    oldValues: options.oldValues,
    newValues: options.newValues,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
    metadata: options.metadata,
  };

  // Add to in-memory store
  auditLogs.push(entry);
  
  // Trim if exceeds max
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.shift();
  }

  // In production, write to database/log service
  // await db.auditLog.create({ data: entry });
  
  // Log to console for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[AUDIT]', JSON.stringify(entry, null, 2));
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export function getAuditLogs(options: {
  limit?: number;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): AuditLogEntry[] {
  let logs = [...auditLogs].reverse(); // Most recent first
  
  if (options.action) {
    logs = logs.filter(log => log.action === options.action);
  }
  
  if (options.userId) {
    logs = logs.filter(log => log.userId === options.userId);
  }
  
  if (options.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= options.startDate!);
  }
  
  if (options.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= options.endDate!);
  }
  
  return logs.slice(0, options.limit || 100);
}

/**
 * Get audit log statistics
 */
export function getAuditStats(): {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByUser: Record<string, number>;
  failedEvents: number;
  last24Hours: number;
} {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const eventsByAction: Record<string, number> = {};
  const eventsByUser: Record<string, number> = {};
  let failedEvents = 0;
  let recentCount = 0;
  
  for (const log of auditLogs) {
    eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
    
    if (log.userEmail) {
      eventsByUser[log.userEmail] = (eventsByUser[log.userEmail] || 0) + 1;
    }
    
    if (!log.success) failedEvents++;
    
    if (new Date(log.timestamp) >= last24Hours) recentCount++;
  }
  
  return {
    totalEvents: auditLogs.length,
    eventsByAction,
    eventsByUser,
    failedEvents,
    last24Hours: recentCount,
  };
}

/**
 * Middleware to audit API requests
 */
export function auditMiddleware(request: NextRequest): void {
  // Log all admin API requests
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    // Don't await - fire and forget
    logAuditEvent('READ', request, {
      resource: 'api',
      resourceId: request.nextUrl.pathname,
      metadata: {
        method: request.method,
        query: Object.fromEntries(request.nextUrl.searchParams),
      },
    });
  }
}