import { jest } from "@jest/globals";
import { awaitHostConfig } from "../hostConfig.js";

describe("awaitHostConfig", () => {
  test("resolves with null when not embedded (window.parent === window)", async () => {
    global.window = { parent: null };
    global.window.parent = global.window;

    await expect(awaitHostConfig()).resolves.toBeNull();
  });

  test("when embedded, posts APP_READY to the parent and resolves with the DFM_CONFIG payload", async () => {
    const postMessage = jest.fn();
    let messageHandler;

    global.window = {
      parent: { postMessage },
      addEventListener: (type, handler) => {
        if (type === "message") messageHandler = handler;
      },
      removeEventListener: jest.fn(),
    };

    const promise = awaitHostConfig();

    expect(postMessage).toHaveBeenCalledWith({ type: "APP_READY" }, "*");

    messageHandler({ data: { type: "DFM_CONFIG", config: { unit: "C" } } });

    await expect(promise).resolves.toEqual({ unit: "C" });
    expect(window.removeEventListener).toHaveBeenCalled();
  });

  test("when embedded, ignores messages that aren't DFM_CONFIG", async () => {
    const postMessage = jest.fn();
    let messageHandler;

    global.window = {
      parent: { postMessage },
      addEventListener: (type, handler) => {
        if (type === "message") messageHandler = handler;
      },
      removeEventListener: jest.fn(),
    };

    const promise = awaitHostConfig();

    messageHandler({ data: { type: "SOMETHING_ELSE" } });
    messageHandler({ data: { type: "DFM_CONFIG", config: { unit: "F" } } });

    await expect(promise).resolves.toEqual({ unit: "F" });
  });
});

/**
 * window isn't a real global in Jest's default "node" test environment (no
 * jsdom here) — same situation as cache.test.js and localStorage. Each test
 * builds just enough of a fake `window` by hand to exercise the function,
 * instead of pulling in a browser-environment dependency for one file.
 */
