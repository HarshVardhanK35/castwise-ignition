export function buildConfig(appConfig, fetchedData) {
  return {
    appName: appConfig.appName,
    config: appConfig,
    data: fetchedData,
  };
}
