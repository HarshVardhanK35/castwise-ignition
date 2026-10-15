// createLogger: builds a prefixed logger that can be silenced via options.enabled
export function createLogger(options = {}) {
  const enabled = options.enabled !== false;
  const prefix = "[IGNITION]";

  function wrap(consoleMethod) {
    return (...args) => {
      if (enabled) {
        consoleMethod(prefix, ...args);
      }
    };
  }

  return {
    log: wrap(console.log),
    warn: wrap(console.warn),
    error: wrap(console.error),
  };
}
