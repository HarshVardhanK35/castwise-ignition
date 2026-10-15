import { jest } from "@jest/globals";
import { fetchData } from "../fetchData.js";

beforeEach(() => {
  let store = {};
  global.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
});

describe("fetchData", () => {
  test("a successful fetch returns the data and caches it", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: "bar" }),
    });

    const result = await fetchData("http://example.com", {
      cacheKey: "key1",
      maxAgeMs: 10000,
      fallbackData: null,
    });

    expect(result).toEqual({ foo: "bar" });
    expect(localStorage.getItem("key1")).not.toBeNull();
  });

  test("if a cached (non-expired) value already exists, fetch is never called", async () => {
    localStorage.setItem(
      "key2",
      JSON.stringify({ data: { cached: true }, cachedAt: Date.now() }),
    );
    global.fetch = jest.fn();

    const result = await fetchData("http://example.com", {
      cacheKey: "key2",
      maxAgeMs: 10000,
      fallbackData: null,
    });

    expect(result).toEqual({ cached: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("returns fallbackData when fetch throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network error"));

    const result = await fetchData("http://example.com", {
      cacheKey: "key3",
      maxAgeMs: 10000,
      fallbackData: { fallback: true },
    });

    expect(result).toEqual({ fallback: true });
  });

  test("returns fallbackData when res.ok is false", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const result = await fetchData("http://example.com", {
      cacheKey: "key4",
      maxAgeMs: 10000,
      fallbackData: { fallback: true },
    });

    expect(result).toEqual({ fallback: true });
  });
});
