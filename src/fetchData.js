import { getCached, getStale, setCached } from "./cache.js";

const noopLogger = { log() {}, warn() {}, error() {} };

const DEFAULT_TIMEOUT_MS = 10000; // a dead connection must not hang an app forever

export async function fetchData(url, options = {}) {
  const { cacheKey, maxAgeMs, fallbackData, timeoutMs = DEFAULT_TIMEOUT_MS, logger = noopLogger } = options;

  const cached = getCached(cacheKey, maxAgeMs);
  if (cached !== null) {
    logger.log(`cache hit for "${cacheKey}" — skipping network fetch`);
    return cached;
  }

  logger.log(`fetching ${url}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Bad response: ${res.status}`);

    const data = await res.json();

    setCached(cacheKey, data);
    logger.log(`fetch succeeded, cached under "${cacheKey}"`);
    return data;
  } catch (err) {
    // The last data this app had (however old) beats an empty screen.
    const stale = getStale(cacheKey);
    if (stale !== null) {
      logger.warn(`fetch failed, using the saved copy under "${cacheKey}" —`, err);
      return stale;
    }
    logger.warn(`fetch failed, using fallbackData —`, err);
    return fallbackData;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * fetchData.js — fetches JSON from a URL with caching and a safe fallback,
 * so a flaky network never leaves a signage app with nothing to render.
 *
 * fetchData(url, options)
 *   url     — the endpoint to fetch JSON from.
 *   options — { cacheKey, maxAgeMs, fallbackData, logger }:
 *     cacheKey     — the key used to read/write this data in the cache.
 *     maxAgeMs     — how old a cached value may be before it's stale.
 *     fallbackData — what to return if fetching fails for any reason AND
 *                    nothing was ever saved for this cacheKey.
 *     timeoutMs    — how long to wait for the network before giving up
 *                    (default 10000), so a dead connection can't hang the app.
 *     logger       — optional (defaults to a silent no-op); when given,
 *                    reports cache hits, outgoing fetches, successes, and
 *                    failures (with the real error) so an app's console
 *                    actually shows what Ignition is doing instead of
 *                    everything happening invisibly.
 *
 *   Behavior:
 *     1. Checks the cache first via getCached(cacheKey, maxAgeMs). If
 *        there's a valid (non-expired) cached value, returns it immediately
 *        without making any network request.
 *     2. Otherwise fetches url, parses the JSON body, saves it to the cache
 *        via setCached(cacheKey, data), and returns it.
 *     3. If the fetch or JSON parsing throws for any reason (network error,
 *        timeout, bad response, etc.), returns the last saved data for that
 *        cacheKey however old it is (getStale), and only if nothing was ever
 *        saved returns fallbackData — never throws, so callers never need a
 *        try/catch of their own around this.
 */
