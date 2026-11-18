/**
 * Logging entry point.
 * 
 * Exports both Edge and Node.js loggers for different runtime contexts.
 */

export {
  EdgeLogger,
  edgeAuthLogger,
  edgeSecurityLogger,
  edgeApiLogger,
  edgeErrorLogger,
  edgePerformanceLogger,
  edgeGeneralLogger,
  getClientInfo as getEdgeClientInfo,
  generateRequestId,
} from "./edge";

export {
  NodeLogger,
  nodeAuthLogger,
  nodeApiLogger,
  nodeSecurityLogger,
  nodeErrorLogger,
  nodePerformanceLogger,
  nodeGeneralLogger,
  withNodeLogging,
  logApiAction,
  getClientInfo,
} from "./node";

export type {
  LogLevel,
  LogEntry,
  RequestLike,
} from "./edge";