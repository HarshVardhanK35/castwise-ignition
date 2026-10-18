# Ignition

A tiny, framework-agnostic runtime for building digital signage "apps" —
self-contained widgets (weather, announcements, RSS tickers, image/video
players, etc.) that run inside a signage player.

Instead of every app reimplementing config parsing, API caching, and
playback lifecycle handling from scratch, an app built on Ignition just
calls one function and gets back everything it needs to render.

## The problem it solves

A signage app needs to:
- Read its own per-device configuration (what API to call, how often to
  refresh, fallback content).
- Fetch its data, without hammering the network every few seconds.
- Know when it's actually visible (playing), paused, muted, or about to
  be skipped, so it can start/stop animations, timers, or media
  accordingly.

Ignition handles all of this once, so an app only has to worry about
rendering.

## Core concept

```js
import { init, updateConfig } from "@castwise/ignition";

const app = await init({
  appName: "weather-widget",
  config: { /* app-specific settings */ },
});

// app.data        -> the fetched (or cached/fallback) API data
// app.config       -> the resolved per-device configuration
app.onPlay(() => { /* start rendering/animating */ });
app.onPause(() => { /* stop/freeze */ });
app.onMute(() => { /* ... */ });
app.onUnmute(() => { /* ... */ });
app.onTimeout(() => { /* this app's time slot ended */ });

// Later — a config change arrived (e.g. the host's settings screen), or a
// periodic refresh is due. Same shape as init(), minus the lifecycle hooks
// (the app already has those from init()).
const updated = await updateConfig({
  appName: "weather-widget",
  config: { /* the new settings */ },
});
```

Ignition never renders anything itself — it only resolves configuration,
data, and lifecycle state. Rendering is entirely up to the app.

## Receiving config from the host

An app embedded inside a host player (an iframe) doesn't get its config
handed to it directly — it has to ask for it over `postMessage`, since the
host and the app usually run on different origins. `watchHostConfig`
handles that handshake:

```js
import { watchHostConfig } from "@castwise/ignition";

const unwatch = watchHostConfig((config) => {
  // Called with the host's config — once on initial load, and again on
  // every later change (e.g. someone editing this app's settings live).
  // Opened directly outside any host (not embedded)? Never called at all —
  // the app should fall back to its own default/demo config in that case.
});

// Call this when the app is torn down, to stop listening.
unwatch();
```

Internally this sends `{ type: "APP_READY" }` to the parent window once,
then listens indefinitely for `{ type: "DFM_CONFIG", config }` messages —
it does **not** resolve once and stop, since a host can push an updated
config at any point after the initial handshake, not just at startup.

## Terms

- **App** — a self-contained signage widget built on top of Ignition.
- **Config** — per-device/per-deployment settings for one app instance
  (API endpoint, refresh interval, fallback data).
- **Payload** — the object `init()` resolves with: config + data +
  lifecycle hooks, everything an app needs to render.
- **Lifecycle event** — play / pause / mute / unmute / timeout — signals
  from the host player about this app's current state.

## Design principles

- **Functional, not class-based.** No `new`, no `this` — everything is
  plain functions and closures.
- **One environment.** Built for the browser. No native-bridge detection,
  no dual-transport abstraction — if it ever needs to run somewhere else,
  that's a separate adapter, not baked into the core.
- **Fail soft.** A failed API call falls back to cached or static data
  instead of leaving the app with nothing to show.

## Install

```
npm install @castwise/ignition
```

## Version

```js
import { VERSION } from "@castwise/ignition";
```

Kept in sync with `package.json` on every publish — apps use this to
report which Ignition build they're actually running against, e.g. in a
startup diagnostic log.

## Testing

Tested with **Jest**, run in ESM mode (this package uses native `import`/
`export`, not CommonJS).

```
npm test
npm test > test-results.txt 2>&1
```

One test file per source file, co-located under `src/__tests__/`:

| File | What it covers |
|---|---|
| `logger.test.js` | `log`/`warn`/`error` fire the right `console` method, and stay silent when `enabled: false`. |
| `lifecycle.test.js` | Registered callbacks fire on the matching `trigger()` event, don't fire on a different event, and multiple callbacks on the same event all run. |
| `cache.test.js` | A fresh cached value round-trips correctly, a never-set key returns `null`, and an expired (older than `maxAgeMs`) value is treated as a miss. |
| `fetchData.test.js` | A successful fetch returns and caches its data; a valid cache hit skips the network call entirely; a thrown error or a non-`ok` response both fall back to `fallbackData` instead of throwing. |
| `hostConfig.test.js` | Not embedded: `onConfig` is never called. Embedded: posts `APP_READY`, calls `onConfig` on every `DFM_CONFIG` message (not just the first), ignores other message types, and the returned unsubscribe actually removes the listener. |
| `config.test.js` | `buildConfig` assembles `appName`/`config`/`data` correctly from its inputs. |
| `index.test.js` | `init()` end-to-end: resolves to `fallbackData` with no `api` configured, returns working lifecycle methods, and `trigger()` actually fires a registered callback. |

## License

MIT
