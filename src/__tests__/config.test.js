import { jest } from "@jest/globals";
import { buildConfig } from "../config.js";

describe("buildConfig", () => {
  test("returns an object with appName, config, and data fields", () => {
    const appConfig = { appName: "weather-widget", refreshInterval: 5000 };
    const fetchedData = { temp: 72 };

    const result = buildConfig(appConfig, fetchedData);

    expect(result.appName).toBe("weather-widget");
    expect(result.config).toBe(appConfig);
    expect(result.data).toBe(fetchedData);
  });
});
