import { jest } from "@jest/globals";
import { init, updateConfig } from "../index.js";

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

describe("updateConfig", () => {
  test("with no api, resolves to appName/config/data: fallbackData", async () => {
    const result = await updateConfig({
      appName: "test-app",
      fallbackData: { foo: "bar" },
    });

    expect(result).toEqual({
      appName: "test-app",
      config: { appName: "test-app", fallbackData: { foo: "bar" } },
      data: { foo: "bar" },
    });
  });

  test("with api set and fetch succeeding, returns fresh data", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ temp: 72 }),
    });

    const result = await updateConfig({
      appName: "weather-widget",
      api: {
        url: "http://example.com",
        cacheKey: "update-key1",
        maxAgeMs: 10000,
      },
    });

    expect(result.data).toEqual({ temp: 72 });
  });

  test("with api set and fetch throwing, falls back to fallbackData", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network error"));

    const result = await updateConfig({
      appName: "weather-widget",
      api: {
        url: "http://example.com",
        cacheKey: "update-key2",
        maxAgeMs: 10000,
        fallbackData: { temp: 0 },
      },
    });

    expect(result.data).toEqual({ temp: 0 });
  });
});
