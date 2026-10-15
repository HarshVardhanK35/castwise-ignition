import { jest } from "@jest/globals";
import { createLifecycle } from "../lifecycle.js";

describe("createLifecycle", () => {
  test("onPlay callback fires on trigger('play')", () => {
    const lifecycle = createLifecycle();
    const cb = jest.fn();

    lifecycle.onPlay(cb);
    lifecycle.trigger("play");

    expect(cb).toHaveBeenCalled();
  });

  test("trigger('pause') does not call a callback registered via onPlay", () => {
    const lifecycle = createLifecycle();
    const cb = jest.fn();

    lifecycle.onPlay(cb);
    lifecycle.trigger("pause");

    expect(cb).not.toHaveBeenCalled();
  });

  test("multiple callbacks on the same event all get called", () => {
    const lifecycle = createLifecycle();
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    lifecycle.onPlay(cb1);
    lifecycle.onPlay(cb2);
    lifecycle.trigger("play");

    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
});

/**
 *
 * jest.fn() creates a new mock function
 *    to track calls and arguments
 *
 *
 *
 */
