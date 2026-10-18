import { createLogger } from "./logger.js";
import { createLifecycle } from "./lifecycle.js";
import { fetchData } from "./fetchData.js";
import { buildConfig } from "./config.js";

export { awaitHostConfig } from "./hostConfig.js";

export async function init(appConfig = {}) {
  const logger = createLogger(appConfig.logging);
  const lifecycle = createLifecycle();

  const data = appConfig.api
    ? await fetchData(appConfig.api.url, appConfig.api)
    : (appConfig.fallbackData ?? null);

  const payload = buildConfig(appConfig, data);

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
  const data = newAppConfig.api
    ? await fetchData(newAppConfig.api.url, newAppConfig.api)
    : (newAppConfig.fallbackData ?? null);

  return buildConfig(newAppConfig, data);
}
