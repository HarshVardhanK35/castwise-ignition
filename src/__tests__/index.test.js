import { jest } from "@jest/globals";
import { init } from "../index.js";

describe("init", () => {
  test("with no api, data equals fallbackData", async () => {
    const app = await init({
      appName: "test-app",
      fallbackData: { foo: "bar" },
    });

    expect(app.data).toEqual({ foo: "bar" });
  });

  test("returned object has working onPlay/onPause/etc. functions", async () => {
    const app = await init({ appName: "test-app" });

    expect(typeof app.onPlay).toBe("function");
    expect(typeof app.onPause).toBe("function");
    expect(typeof app.onMute).toBe("function");
    expect(typeof app.onUnmute).toBe("function");
    expect(typeof app.onTimeout).toBe("function");
  });

  test("trigger('play') fires a callback registered via onPlay", async () => {
    const app = await init({ appName: "test-app" });
    const cb = jest.fn();

    app.onPlay(cb);
    app.trigger("play");

    expect(cb).toHaveBeenCalled();
  });
});
