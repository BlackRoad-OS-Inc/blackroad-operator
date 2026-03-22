/**
 * Logger Tests
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger, logDebug, logInfo, logWarn, logError } from "../src/logging/logger";
import type { LogContext } from "../src/logging/types";

describe("Logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("createLogger", () => {
    test("should create logger with base context", () => {
      const logger = createLogger({ service: "test-service", env: "local" });

      logger.info("test message");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("info");
      expect(output.message).toBe("test message");
      expect(output.context.service).toBe("test-service");
      expect(output.context.env).toBe("local");
      expect(output.timestamp).toBeTruthy();
    });

    test("should log debug messages", () => {
      const logger = createLogger({ service: "test-service", env: "local" });

      logger.debug("debug message", { requestId: "123" });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("debug");
      expect(output.message).toBe("debug message");
      expect(output.context.requestId).toBe("123");
    });

    test("should log warn messages", () => {
      const logger = createLogger({ service: "test-service", env: "local" });

      logger.warn("warning message");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("warn");
      expect(output.message).toBe("warning message");
    });

    test("should log error messages to stderr", () => {
      const logger = createLogger({ service: "test-service", env: "local" });

      logger.error("error message");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("error");
      expect(output.message).toBe("error message");
    });

    test("should include error details when provided", () => {
      const logger = createLogger({ service: "test-service", env: "local" });
      const error = new Error("test error");

      logger.error("error occurred", error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(output.error).toBeDefined();
      expect(output.error.name).toBe("Error");
      expect(output.error.message).toBe("test error");
      expect(output.error.stack).toBeTruthy();
    });

    test("should merge additional context with base context", () => {
      const logger = createLogger({ service: "test-service", env: "local", component: "api" });

      logger.info("test", { requestId: "456" });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.context.service).toBe("test-service");
      expect(output.context.env).toBe("local");
      expect(output.context.component).toBe("api");
      expect(output.context.requestId).toBe("456");
    });
  });

  describe("standalone logging functions", () => {
    const context: LogContext = { service: "test-service", env: "local" };

    test("logDebug should log debug message", () => {
      logDebug("debug message", context);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("debug");
      expect(output.message).toBe("debug message");
    });

    test("logInfo should log info message", () => {
      logInfo("info message", context);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("info");
      expect(output.message).toBe("info message");
    });

    test("logWarn should log warn message", () => {
      logWarn("warn message", context);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("warn");
      expect(output.message).toBe("warn message");
    });

    test("logError should log error message to stderr", () => {
      logError("error message", context);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(output.level).toBe("error");
      expect(output.message).toBe("error message");
    });

    test("logError should include error details", () => {
      const error = new Error("test error");
      logError("error occurred", context, error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(output.error).toBeDefined();
      expect(output.error.name).toBe("Error");
      expect(output.error.message).toBe("test error");
    });
  });
});
