type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

function log(entry: LogEntry) {
  const output = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log(createLogEntry("debug", message, context)),
  info: (message: string, context?: Record<string, unknown>) =>
    log(createLogEntry("info", message, context)),
  warn: (message: string, context?: Record<string, unknown>) =>
    log(createLogEntry("warn", message, context)),
  error: (message: string, context?: Record<string, unknown>) =>
    log(createLogEntry("error", message, context)),
};
