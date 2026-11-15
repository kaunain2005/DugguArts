import { z } from 'zod';

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  allowNewlines?: boolean;
} = {}): string {
  const { maxLength = 10000, allowHtml = false, allowNewlines = true } = options;
  
  let sanitized = input;
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  if (!allowHtml) {
    // Remove HTML tags and decode entities
    sanitized = sanitized
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }
  
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  }
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email.toLowerCase().trim(), { maxLength: 254 });
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url.trim(), { maxLength: 2048 });
  
  // Ensure URL has valid protocol
  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return sanitized;
  } catch {
    return '';
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeString(v) : 
        typeof v === 'object' && v !== null ? sanitizeObject(v as Record<string, unknown>) : v
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  
  return sanitized as T;
}

/**
 * Validate and sanitize pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Validate and sanitize search parameters
 */
export const searchSchema = z.object({
  search: z.string().max(200).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;

/**
 * Sanitize and validate file upload metadata
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.+/g, '.') // Multiple dots to single
    .replace(/^_+|_+$/g, '') // Trim underscores
    .slice(0, 255); // Max length
}

/**
 * XSS-safe HTML output helper (for server-side rendering)
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '\u0027')
    .replace(/\//g, '&#x2F;');
}

/**
 * Safe JSON parse with validation
 */
export function safeJsonParse<T>(json: string, schema?: z.ZodSchema<T>): T | null {
  try {
    const parsed = JSON.parse(json);
    if (schema) {
      return schema.parse(parsed);
    }
    return parsed;
  } catch {
    return null;
  }
}