import type { LogLevel } from "./logger-types";

export type { LogLevel } from "./logger-types";

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeLevel(level: string | undefined): LogLevel {
  if (level === "debug" || level === "info" || level === "warn" || level === "error") {
    return level;
  }

  return "info";
}

function redactContext(context: Record<string, unknown> = {}): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (/token|secret|password|api.?key|authorization/i.test(key)) {
      redacted[key] = "[REDACTED]";
      continue;
    }

    redacted[key] = value;
  }

  return redacted;
}

export function createLogger(level = normalizeLevel(process.env.LOG_LEVEL)): Logger {
  function write(targetLevel: LogLevel, message: string, context?: Record<string, unknown>) {
    if (levelPriority[targetLevel] < levelPriority[level]) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level: targetLevel,
      message,
      ...redactContext(context),
    };

    const serialized = JSON.stringify(payload);

    if (targetLevel === "error") {
      console.error(serialized);
      return;
    }

    if (targetLevel === "warn") {
      console.warn(serialized);
      return;
    }

    console.log(serialized);
  }

  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
  };
}

export const logger = createLogger();
