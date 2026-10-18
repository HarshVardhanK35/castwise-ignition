import { createLogger } from "./logger.js";
import { createLifecycle } from "./lifecycle.js";
import { fetchData } from "./fetchData.js";
import { buildConfig } from "./config.js";

export { watchHostConfig } from "./hostConfig.js";

// Bump this alongside package.json's "version" on every publish — apps
// read this to report which Ignition build they're actually running
// against (e.g. a "bootstrap:mounted" diagnostic log), same as the real
// engine's own version tag.
export const VERSION = "1.3.0";

export async function init(appConfig = {}) {
  const logger = createLogger(appConfig.logging);
  const lifecycle = createLifecycle();

  logger.log(`init("${appConfig.appName ?? "unknown app"}")`);

  const data = appConfig.api
    ? await fetchData(appConfig.api.url, { ...appConfig.api, logger })
    : (appConfig.fallbackData ?? null);

  const payload = buildConfig(appConfig, data);

  logger.log("init() ready");

  return {
    ...payload,
    onPlay: lifecycle.onPlay,
    onPause: lifecycle.onPause,
    onMute: lifecycle.onMute,
    onUnmute: lifecycle.onUnmute,
    onTimeout: lifecycle.onTimeout,
    trigger: lifecycle.trigger,
    logger,
  };
}

export async function updateConfig(newAppConfig = {}) {
  const logger = createLogger(newAppConfig.logging);

  logger.log(`updateConfig("${newAppConfig.appName ?? "unknown app"}")`);

  const data = newAppConfig.api
    ? await fetchData(newAppConfig.api.url, { ...newAppConfig.api, logger })
    : (newAppConfig.fallbackData ?? null);

  return buildConfig(newAppConfig, data);
}
