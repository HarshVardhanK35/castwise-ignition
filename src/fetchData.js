import { getCached, setCached } from "./cache.js";

export async function fetchData(url, options = {}) {
  const { cacheKey, maxAgeMs, fallbackData } = options;

  const cached = getCached(cacheKey, maxAgeMs);
  if (cached !== null) {
    return cached;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");
    
    const data = await res.json();

    setCached(cacheKey, data);
    return data;
  } catch {
    return fallbackData;
  }
}

/**
 * fetchData.js — fetches JSON from a URL with caching and a safe fallback,
 * so a flaky network never leaves a signage app with nothing to render.
 *
 * fetchData(url, options)
 *   url     — the endpoint to fetch JSON from.
 *   options — { cacheKey, maxAgeMs, fallbackData }:
 *     cacheKey     — the key used to read/write this data in the cache.
 *     maxAgeMs     — how old a cached value may be before it's stale.
 *     fallbackData — what to return if fetching fails for any reason.
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
