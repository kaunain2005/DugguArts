
/**
 * Edge-safe logging entry point.
 *
 * Do not export Node.js logger implementations from here.
 * Node.js modules must import directly from ./node.
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

export type {
  LogLevel,
  LogEntry,
  RequestLike,
} from "./edge";
