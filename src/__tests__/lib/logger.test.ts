import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages to console.log as JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Test message", { key: "value" });

    expect(spy).toHaveBeenCalledOnce();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("info");
    expect(output.message).toBe("Test message");
    expect(output.context).toEqual({ key: "value" });
    expect(output.timestamp).toBeDefined();
  });

  it("logs debug messages to console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.debug("Debug message");

    expect(spy).toHaveBeenCalledOnce();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("debug");
    expect(output.message).toBe("Debug message");
  });

  it("logs warn messages to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("Warning message");

    expect(spy).toHaveBeenCalledOnce();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("warn");
    expect(output.message).toBe("Warning message");
  });

  it("logs error messages to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("Error message", { code: 500 });

    expect(spy).toHaveBeenCalledOnce();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("error");
    expect(output.message).toBe("Error message");
    expect(output.context).toEqual({ code: 500 });
  });

  it("includes ISO timestamp in log entries", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Timestamp test");

    const output = JSON.parse(spy.mock.calls[0][0]);
    // Valid ISO timestamp
    expect(() => new Date(output.timestamp)).not.toThrow();
    expect(new Date(output.timestamp).toISOString()).toBe(output.timestamp);
  });

  it("handles undefined context gracefully", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("No context");

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.context).toBeUndefined();
  });
});
