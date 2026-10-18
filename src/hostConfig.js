// watchHostConfig: the "receive config from host" transport step — same
// role as a real signage engine's getInitialMessage(), scoped down to
// browser-only postMessage (Ignition only ever targets a browser, never a
// native bridge, so there's no second transport to support here).

// Not embedded (opened directly, e.g. a browser tab during local dev) ->
// onConfig is never called at all; the caller keeps using its own demo/
// default config. Returns a no-op unsubscribe.

// Embedded (inside an iframe) -> sends APP_READY, then calls onConfig with
// EVERY DFM_CONFIG message that arrives — not just the first. A settings
// screen keeps posting a fresh DFM_CONFIG on every live edit (not just
// once at open), so this has to keep listening for the app's whole
// lifetime, not resolve-once like a plain Promise would. Returns an
// unsubscribe function — call it (e.g. on unmount) to stop listening.

export function watchHostConfig(onConfig) {
  if (window.parent === window) {
    return () => {};
  }

  function handleMessage(event) {
    if (event.data?.type !== "DFM_CONFIG") return;
    onConfig(event.data.config);
  }

  window.addEventListener("message", handleMessage);
  window.parent.postMessage({ type: "APP_READY" }, "*");

  return () => window.removeEventListener("message", handleMessage);
}
