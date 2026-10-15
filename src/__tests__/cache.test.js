import { jest } from "@jest/globals";
import { getCached, setCached } from "../cache.js";

beforeAll(() => {
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

beforeEach(() => {
  localStorage.removeItem("test-key");
});

describe("cache", () => {
  test("setCached then getCached with a fresh value returns that value", () => {
    setCached("test-key", { hello: "world" });

    expect(getCached("test-key", 10000)).toEqual({ hello: "world" });
  });

  test("getCached on a key that was never set returns null", () => {
    expect(getCached("never-set", 10000)).toBeNull();
  });

  test("getCached returns null when the stored value is older than maxAgeMs", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    setCached("test-key", { hello: "world" });

    Date.now.mockReturnValue(now + 20000);

    expect(getCached("test-key", 10000)).toBeNull();

    Date.now.mockRestore();
  });
});

/**
 *
 * Checks whether two values are equal by comparing their contents.
 *    Example: expect({ name: "Ram" }).toEqual({ name: "Ram" });
 *
 */
