import { Timestamp } from "firebase-admin/firestore";

/**
 * Type guard to check if a value is a Firestore Timestamp
 */
export declare function isTimestamp(value: unknown): value is { toDate(): Date };

/**
 * Safely extracts a Date from a Firestore Timestamp field.
 * Handles Firestore Timestamp objects, Date objects, strings, numbers, and undefined.
 */
export declare function getTimestampDate(value: unknown): Date | null;

/**
 * Safely extracts a Timestamp field from Firestore data
 */
export declare function getTimestamp(data: unknown, field: string): Date | null;

/**
 * Safely extracts a Timestamp field as ISO string
 */
export declare function getTimestampISO(data: unknown, field: string): string | null;

/**
 * Safely extracts a Timestamp field as milliseconds
 */
export declare function getTimestampMillis(data: unknown, field: string): number | null;

/**
 * Converts Firestore document data to a plain object with Dates instead of Timestamps
 */
export declare function convertTimestampsToDates<T extends Record<string, unknown>>(
  data: Record<string, unknown> | undefined,
  timestampFields: string[]
): Record<string, unknown>;

/**
 * Type-safe data extractor for Firestore documents
 */
export declare function getDocData<T extends Record<string, unknown>>(
  doc: { data(): Record<string, unknown> | undefined; exists: boolean }
): T | null;

/**
 * Common timestamp field names used in the application
 */
export declare const COMMON_TIMESTAMP_FIELDS: readonly [
  "createdAt",
  "updatedAt",
  "reviewDate",
  "orderDate",
  "requiredDate",
  "lastLoginAt",
  "passwordUpdatedAt",
  "passwordSetAt"
];

export type CommonTimestampField = typeof COMMON_TIMESTAMP_FIELDS[number];