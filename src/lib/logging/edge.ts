
/**
 * Edge Runtime Compatible Logger
 *
 * Uses console methods only.
 * Never import Node.js modules in this file.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

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

export interface RequestLike {
  nextUrl?: {
    pathname: string;
    searchParams: URLSearchParams;
  };
  method?: string;
  headers: Headers;
}

export class EdgeLogger {
  constructor(private readonly category: string) {}

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    request?: RequestLike
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message,
      metadata: {
        ...metadata,
        ...(request
          ? {
              requestId:
                request.headers.get("x-request-id") || "unknown",
            }
          : {}),
      },
      route: request?.nextUrl?.pathname,
      method: request?.method,
      ip:
        request?.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request?.headers.get("x-real-ip") ||
        undefined,
      userAgent: request?.headers.get("user-agent") || undefined,
      requestId: request?.headers.get("x-request-id") || undefined,
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.info(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
      case "fatal":
        console.error(output);
        break;
    }
  }

  debug(message: string, metadata?: unknown, request?: RequestLike): void {
    this.log("debug", message, metadata as Record<string, unknown> | undefined, request);
  }

  info(message: string, metadata?: unknown, request?: RequestLike): void {
    this.log("info", message, metadata as Record<string, unknown> | undefined, request);
  }

  warn(message: string, metadata?: unknown, request?: RequestLike): void {
    this.log("warn", message, metadata as Record<string, unknown> | undefined, request);
  }

  error(message: string, metadata?: unknown, request?: RequestLike): void {
    this.log("error", message, metadata as Record<string, unknown> | undefined, request);
  }

  fatal(message: string, metadata?: unknown, request?: RequestLike): void {
    this.log("fatal", message, metadata as Record<string, unknown> | undefined, request);
  }

  logRequest(
    request: RequestLike,
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    this.info(
      `Request: ${action}`,
      {
        ...metadata,
        query: request.nextUrl?.searchParams
          ? Object.fromEntries(request.nextUrl.searchParams)
          : {},
        method: request.method,
      },
      request
    );
  }

  logAuth(
    action: string,
    metadata?: Record<string, unknown>,
    request?: RequestLike
  ): void {
    this.info(`Auth: ${action}`, metadata, request);
  }

  logSecurity(
    action: string,
    metadata?: Record<string, unknown>,
    request?: RequestLike
  ): void {
    this.warn(`Security: ${action}`, metadata, request);
  }

  logError(
    error: Error,
    context?: string | Record<string, unknown>,
    request?: RequestLike
  ): void {
    const contextObj =
      typeof context === "string" ? { context } : context;

    this.error(
      `Error${contextObj ? ` in ${contextObj.context || "unknown"}` : ""}: ${error.message}`,
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
    request?: RequestLike
  ): void {
    this.log(
      duration > 1000 ? "warn" : "info",
      `Performance: ${action}`,
      {
        ...metadata,
        duration,
        slow: duration > 1000,
      },
      request
    );
  }
}

// Preconfigured Edge loggers
export const edgeAuthLogger = new EdgeLogger("auth");
export const edgeSecurityLogger = new EdgeLogger("security");
export const edgeApiLogger = new EdgeLogger("api");
export const edgeErrorLogger = new EdgeLogger("errors");
export const edgePerformanceLogger = new EdgeLogger("performance");
export const edgeGeneralLogger = new EdgeLogger("general");

export function getClientInfo(request: { headers: Headers }): {
  ip: string;
  userAgent: string;
  referer: string | null;
} {
  return {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer"),
  };
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
