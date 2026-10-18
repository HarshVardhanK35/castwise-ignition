// awaitHostConfig: the "receive config from host" transport step — same
// role as a real signage engine's getInitialMessage(), scoped down to
// browser-only postMessage (Ignition only ever targets a browser, never a
// native bridge, so there's no second transport to support here).

// Not embedded (opened directly, e.g. a browser tab during local dev) ->
// resolves immediately with null, since there's no host to hand a
// handshake to — callers fall back to their own demo/default config.

// Embedded (inside an iframe) -> sends APP_READY to the parent, waits for
// a DFM_CONFIG reply, resolves with its raw config payload.

export function awaitHostConfig() {
  if (window.parent === window) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    function handleMessage(event) {
      if (event.data?.type !== "DFM_CONFIG") return;
      window.removeEventListener("message", handleMessage);
      resolve(event.data.config);
    }

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "APP_READY" }, "*");
  });
}
