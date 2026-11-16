
/**
 * Node.js Runtime Logger
 *
 * Only for Node.js server-side modules.
 * Never import this file from middleware or Edge modules.
 */

import "server-only";

import {
  mkdirSync,
  appendFileSync,
  existsSync,
} from "node:fs";

import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const LOGS_DIR = join(process.cwd(), "logs");

const LOG_DIRS = [
  "auth",
  "api",
  "security",
  "errors",
  "performance",
  "general",
];

export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  route?: string;
  action?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

function ensureLogDirectories(): void {
  for (const dir of LOG_DIRS) {
    const dirPath = join(LOGS_DIR, dir);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }
}

export class NodeLogger {
  constructor(private readonly category: string) {}

  private getLogFilePath(level: LogLevel): string {
    const date = new Date().toISOString().split("T")[0];

    return join(
      LOGS_DIR,
      this.category,
      `${level}-${date}.log`
    );
  }

  private writeLog(entry: LogEntry): void {
    try {
      ensureLogDirectories();

      const filePath = this.getLogFilePath(entry.level);
      appendFileSync(
        filePath,
        JSON.stringify(entry) + "\n",
        "utf8"
      );
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    request?: NextRequest
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message,
      metadata,
      route: request?.nextUrl.pathname,
      method: request?.method,
      ip:
        request?.headers.get("x-forwarded-for") ||
        request?.headers.get("x-real-ip") ||
        undefined,
      userAgent:
        request?.headers.get("user-agent") || undefined,
      requestId:
        request?.headers.get("x-request-id") ||
        crypto.randomUUID(),
    };
  }

  debug(message: string, metadata?: Record<string, unknown>, request?: NextRequest): void {
    this.writeLog(this.createEntry("debug", message, metadata, request));
  }

  info(message: string, metadata?: Record<string, unknown>, request?: NextRequest): void {
    this.writeLog(this.createEntry("info", message, metadata, request));
  }

  warn(message: string, metadata?: Record<string, unknown>, request?: NextRequest): void {
    this.writeLog(this.createEntry("warn", message, metadata, request));
  }

  error(message: string, metadata?: Record<string, unknown>, request?: NextRequest): void {
    this.writeLog(this.createEntry("error", message, metadata, request));
  }

  fatal(message: string, metadata?: Record<string, unknown>, request?: NextRequest): void {
    this.writeLog(this.createEntry("fatal", message, metadata, request));
  }

  logRequest(
    request: NextRequest,
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    this.info(
      `Request: ${action}`,
      {
        ...metadata,
        query: Object.fromEntries(request.nextUrl.searchParams),
        method: request.method,
      },
      request
    );
  }

  logResponse(
    request: NextRequest,
    response: NextResponse,
    action: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    const level = response.status >= 400 ? "warn" : "info";

    this.writeLog({
      ...this.createEntry(level, `Response: ${action}`, metadata, request),
      route: request.nextUrl.pathname,
      method: request.method,
      action,
      statusCode: response.status,
      duration,
    });
  }

  logAuth(
    action: string,
    metadata?: Record<string, unknown>,
    request?: NextRequest
  ): void {
    this.info(`Auth: ${action}`, metadata, request);
  }

  logSecurity(
    action: string,
    metadata?: Record<string, unknown>,
    request?: NextRequest
  ): void {
    this.warn(`Security: ${action}`, metadata, request);
  }

  logError(
    error: Error,
    context?: string | Record<string, unknown>,
    request?: NextRequest
  ): void {
    const contextObj =
      typeof context === "string" ? { context } : context;

    this.error(
      `Error: ${error.message}`,
      {
        ...contextObj,
        name: error.name,
        stack: error.stack,
      },
      request
    );
  }

  logPerformance(
    action: string,
    duration: number,
    metadata?: Record<string, unknown>,
    request?: NextRequest
  ): void {
    const level = duration > 1000 ? "warn" : "info";

    this.writeLog(
      this.createEntry(
        level,
        `Performance: ${action}`,
        {
          ...metadata,
          duration,
          slow: duration > 1000,
        },
        request
      )
    );
  }
}

// Preconfigured Node.js loggers
export const nodeAuthLogger = new NodeLogger("auth");
export const nodeApiLogger = new NodeLogger("api");
export const nodeSecurityLogger = new NodeLogger("security");
export const nodeErrorLogger = new NodeLogger("errors");
export const nodePerformanceLogger = new NodeLogger("performance");
export const nodeGeneralLogger = new NodeLogger("general");

// Node.js API logging wrapper
export function withNodeLogging(
  handler: (request: NextRequest) => Promise<NextResponse>,
  category = "api"
): (request: NextRequest) => Promise<NextResponse> {
  const logger = new NodeLogger(category);

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);

    logger.info("Incoming request", {
      requestId,
      route: request.nextUrl.pathname,
      method: request.method,
    }, request);

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      logger.logResponse(
        request,
        response,
        "API Response",
        duration,
        { requestId }
      );

      response.headers.set("X-Response-Time", `${duration}ms`);
      response.headers.set("X-Request-ID", requestId);

      if (duration > 1000) {
        nodePerformanceLogger.warn("Slow request", {
          route: request.nextUrl.pathname,
          method: request.method,
          duration,
          requestId,
        }, request);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err =
        error instanceof Error ? error : new Error(String(error));

      logger.error("Handler error", {
        route: request.nextUrl.pathname,
        method: request.method,
        duration,
        error: err.message,
        requestId,
      }, request);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
            requestId,
          },
        },
        { status: 500 }
      );
    }
  };
}

export function logApiAction(
  category: string,
  action: string,
  request: NextRequest,
  metadata?: Record<string, unknown>
): void {
  new NodeLogger(category).logRequest(request, action, metadata);
}

export function getClientInfo(request: NextRequest): {
  ip: string;
  userAgent: string;
  referer: string | null;
  country?: string;
} {
  return {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer"),
    country:
      request.headers.get("x-vercel-ip-country") || undefined,
  };
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
