/**
 * Config Loader Tests
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { loadCoreConfig, getRequiredEnv, getOptionalEnv } from "../src/config/loader";

describe("Config Loader", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of the environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore the original environment
    process.env = originalEnv;
  });

  test("should load config with all required fields", () => {
    process.env.TEST_SERVICE_NAME = "test-service";
    process.env.TEST_ENV = "staging";
    process.env.TEST_LOG_LEVEL = "debug";

    const config = loadCoreConfig("TEST");

    expect(config.serviceName).toBe("test-service");
    expect(config.env).toBe("staging");
    expect(config.logLevel).toBe("debug");
  });

  test("should use defaults for optional fields", () => {
    process.env.TEST_SERVICE_NAME = "test-service";

    const config = loadCoreConfig("TEST");

    expect(config.env).toBe("local"); // default
    expect(config.logLevel).toBe("info"); // default
  });

  test("should include optional version and commit", () => {
    process.env.TEST_SERVICE_NAME = "test-service";
    process.env.TEST_VERSION = "1.0.0";
    process.env.TEST_COMMIT = "abc123";

    const config = loadCoreConfig("TEST");

    expect(config.version).toBe("1.0.0");
    expect(config.commit).toBe("abc123");
  });

  test("should throw error for missing service name", () => {
    delete process.env.TEST_SERVICE_NAME;

    expect(() => loadCoreConfig("TEST")).toThrow(/Service name is required/);
  });

  test("should throw error for invalid environment", () => {
    process.env.TEST_SERVICE_NAME = "test-service";
    process.env.TEST_ENV = "invalid";

    expect(() => loadCoreConfig("TEST")).toThrow(/Invalid environment "invalid"/);
  });

  test("should throw error for invalid log level", () => {
    process.env.TEST_SERVICE_NAME = "test-service";
    process.env.TEST_LOG_LEVEL = "invalid";

    expect(() => loadCoreConfig("TEST")).toThrow(/Invalid log level "invalid"/);
  });

  test("should accept all valid environments", () => {
    const validEnvs = ["local", "staging", "prod"];

    validEnvs.forEach((env) => {
      process.env.TEST_SERVICE_NAME = "test-service";
      process.env.TEST_ENV = env;

      const config = loadCoreConfig("TEST");
      expect(config.env).toBe(env);
    });
  });

  test("should accept all valid log levels", () => {
    const validLevels = ["debug", "info", "warn", "error"];

    validLevels.forEach((level) => {
      process.env.TEST_SERVICE_NAME = "test-service";
      process.env.TEST_LOG_LEVEL = level;

      const config = loadCoreConfig("TEST");
      expect(config.logLevel).toBe(level);
    });
  });

  test("getRequiredEnv should return value when set", () => {
    process.env.REQUIRED_VAR = "test-value";

    const value = getRequiredEnv("REQUIRED_VAR");
    expect(value).toBe("test-value");
  });

  test("getRequiredEnv should throw when not set", () => {
    delete process.env.REQUIRED_VAR;

    expect(() => getRequiredEnv("REQUIRED_VAR")).toThrow(
      /Missing required environment variable: REQUIRED_VAR/
    );
  });

  test("getOptionalEnv should return value when set", () => {
    process.env.OPTIONAL_VAR = "test-value";

    const value = getOptionalEnv("OPTIONAL_VAR", "default");
    expect(value).toBe("test-value");
  });

  test("getOptionalEnv should return default when not set", () => {
    delete process.env.OPTIONAL_VAR;

    const value = getOptionalEnv("OPTIONAL_VAR", "default");
    expect(value).toBe("default");
  });
});
