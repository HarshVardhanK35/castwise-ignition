import { jest } from "@jest/globals";
import { createLogger } from "../logger.js";

describe("createLogger", () => {
  test("log() calls console.log when enabled", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const logger = createLogger({ enabled: true });

    logger.log("hello");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("log() does not call console.log when disabled", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const logger = createLogger({ enabled: false });

    logger.log("hello");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("warn() calls console.warn when enabled", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createLogger({ enabled: true });

    logger.warn("careful");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("warn() does not call console.warn when disabled", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createLogger({ enabled: false });

    logger.warn("careful");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("error() calls console.error when enabled", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logger = createLogger({ enabled: true });

    logger.error("oops");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("error() does not call console.error when disabled", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logger = createLogger({ enabled: false });

    logger.error("oops");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

/**
 * describe - a whole function - groups related test cases
 *    takes fn which needs to be tested - 1st arg
 *    and a callback fn - 2nd arg
 *
 * test() - defines single test case
 *
 * jest.spyOn() – monitors a method, here console.log
 *
 * mockImplementation(() => {}) – replaces the original method with an empty function
 *
 * createLogger({ enabled: true }) – creates a logger with logging enabled
 *
 * logger.log("hello") – calls the logger's log() method
 *
 * expect() – checks whether a result meets a condition
 *
 * toHaveBeenCalled() – checks whether console.log was called at least once
 *
 * mockRestore() – restores the original console.log implementation
 *
 */
