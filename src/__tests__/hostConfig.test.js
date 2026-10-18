import { jest } from "@jest/globals";
import { watchHostConfig } from "../hostConfig.js";

describe("watchHostConfig", () => {
  test("not embedded (window.parent === window): onConfig is never called, returns a no-op unsubscribe", () => {
    global.window = { parent: null };
    global.window.parent = global.window;

    const onConfig = jest.fn();
    const unsubscribe = watchHostConfig(onConfig);

    expect(onConfig).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
  });

  test("when embedded, posts APP_READY to the parent and calls onConfig on every DFM_CONFIG message", () => {
    const postMessage = jest.fn();
    let messageHandler;

    global.window = {
      parent: { postMessage },
      addEventListener: (type, handler) => {
        if (type === "message") messageHandler = handler;
      },
      removeEventListener: jest.fn(),
    };

    const onConfig = jest.fn();
    watchHostConfig(onConfig);

    expect(postMessage).toHaveBeenCalledWith({ type: "APP_READY" }, "*");

    messageHandler({ data: { type: "DFM_CONFIG", config: { unit: "C" } } });
    expect(onConfig).toHaveBeenCalledWith({ unit: "C" });

    // A second, later message (e.g. a live settings edit) must still reach
    // onConfig — this is the whole point: the listener does NOT stop after
    // the first message, unlike a one-shot Promise.
    messageHandler({ data: { type: "DFM_CONFIG", config: { unit: "F" } } });
    expect(onConfig).toHaveBeenCalledWith({ unit: "F" });
    expect(onConfig).toHaveBeenCalledTimes(2);
  });

  test("when embedded, ignores messages that aren't DFM_CONFIG", () => {
    const postMessage = jest.fn();
    let messageHandler;

    global.window = {
      parent: { postMessage },
      addEventListener: (type, handler) => {
        if (type === "message") messageHandler = handler;
      },
      removeEventListener: jest.fn(),
    };

    const onConfig = jest.fn();
    watchHostConfig(onConfig);

    messageHandler({ data: { type: "SOMETHING_ELSE" } });

    expect(onConfig).not.toHaveBeenCalled();
  });

  test("the returned unsubscribe function removes the message listener", () => {
    const postMessage = jest.fn();
    const removeEventListener = jest.fn();

    global.window = {
      parent: { postMessage },
      addEventListener: jest.fn(),
      removeEventListener,
    };

    const unsubscribe = watchHostConfig(jest.fn());
    unsubscribe();

    expect(removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });
});

/**
 * window isn't a real global in Jest's default "node" test environment (no
 * jsdom here) — same situation as cache.test.js and localStorage. Each test
 * builds just enough of a fake `window` by hand to exercise the function,
 * instead of pulling in a browser-environment dependency for one file.
 */
