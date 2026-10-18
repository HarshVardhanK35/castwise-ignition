import { getCached, setCached } from "./cache.js";

const noopLogger = { log() {}, warn() {}, error() {} };

export async function fetchData(url, options = {}) {
  const { cacheKey, maxAgeMs, fallbackData, logger = noopLogger } = options;

  const cached = getCached(cacheKey, maxAgeMs);
  if (cached !== null) {
    logger.log(`cache hit for "${cacheKey}" — skipping network fetch`);
    return cached;
  }

  logger.log(`fetching ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bad response: ${res.status}`);

    const data = await res.json();

    setCached(cacheKey, data);
    logger.log(`fetch succeeded, cached under "${cacheKey}"`);
    return data;
  } catch (err) {
    logger.warn(`fetch failed, using fallbackData —`, err);
    return fallbackData;
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
 *     fallbackData — what to return if fetching fails for any reason.
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
 *        bad response, etc.), returns fallbackData instead of throwing —
 *        callers never need a try/catch of their own around this.
 */
