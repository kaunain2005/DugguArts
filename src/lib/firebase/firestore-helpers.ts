import { Timestamp } from "firebase-admin/firestore";

/**
 * Type guard to check if a value is a Firestore Timestamp
 */
export function isTimestamp(value: unknown): value is { toDate(): Date } {
  return value !== null && typeof value === "object" && "toDate" in value;
}

/**
 * Safely extracts a Date from a Firestore Timestamp field.
 * Handles Firestore Timestamp objects, Date objects, strings, numbers, and undefined.
 */
export function getTimestampDate(value: unknown): Date | null {
  if (value === undefined || value === null) {
    return null;
  }

  // Firestore Timestamp object
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate(): Date }).toDate();
  }

  // Date object
  if (value instanceof Date) {
    return value;
  }

  // String or number (timestamp)
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Safely extracts a Timestamp field from Firestore data
 */
export function getTimestamp(data: unknown, field: string): Date | null {
  if (!data || typeof data !== "object") return null;
  return getTimestampDate((data as Record<string, unknown>)[field]);
}

/**
 * Safely extracts a Timestamp field as ISO string
 */
export function getTimestampISO(data: unknown, field: string): string | null {
  if (!data || typeof data !== "object") return null;
  const date = getTimestamp(data as Record<string, unknown>, field);
  return date ? date.toISOString() : null;
}

/**
 * Safely extracts a Timestamp field as milliseconds
 */
export function getTimestampMillis(data: unknown, field: string): number | null {
  if (!data || typeof data !== "object") return null;
  const value = (data as Record<string, unknown>)[field];
  if (!value) return null;
  
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis(): number }).toMillis();
  }
  
  if (value instanceof Date) {
    return value.getTime();
  }
  
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.getTime();
  }
  
  return null;
}

/**
 * Converts Firestore document data to a plain object with Dates instead of Timestamps
 */
export function convertTimestampsToDates<T extends Record<string, unknown>>(
  data: Record<string, unknown> | undefined,
  timestampFields: string[] = []
): Record<string, unknown> {
  if (!data) return {};
  const result = { ...data };
  for (const field of [
    "createdAt",
    "updatedAt",
    "reviewDate",
    "orderDate",
    "requiredDate",
    "lastLoginAt",
    "passwordUpdatedAt",
    "passwordSetAt",
    ...timestampFields
  ]) {
    const date = getTimestamp(data, field);
    if (date) {
      result[field] = date;
    }
  }
  return result;
}

/**
 * Type-safe data extractor for Firestore documents
 */
export function getDocData<T extends Record<string, unknown>>(
  doc: { data(): Record<string, unknown> | undefined; exists: boolean }
): T | null {
  if (!doc.exists) return null;
  return doc.data() as T;
}

/**
 * Common timestamp field names used in the application
 */
export const COMMON_TIMESTAMP_FIELDS = [
  "createdAt",
  "updatedAt",
  "reviewDate",
  "orderDate",
  "requiredDate",
  "lastLoginAt",
  "passwordUpdatedAt",
  "passwordSetAt",
] as const;

export type CommonTimestampField = typeof COMMON_TIMESTAMP_FIELDS[number];