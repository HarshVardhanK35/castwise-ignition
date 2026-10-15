export function getCached(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > maxAgeMs) return null;

    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    // storage unavailable (private browsing, disabled, quota exceeded) — ignore
  }
}

/**
 * cache.js — simple localStorage-backed cache with expiry, used by Ignition
 * apps to avoid re-fetching data on every refresh.
 *
 * setCached(key, data)
 *   Takes a string key and any JSON-serializable data. Saves it to
 *   localStorage as { data, cachedAt: Date.now() } under that key.
 *   If localStorage isn't available (private browsing, quota exceeded,
 *   storage disabled), it fails silently — nothing is saved, no error thrown.
 *
 * getCached(key, maxAgeMs)
 *   Takes the same key, plus how old (in milliseconds) a cached value is
 *   allowed to be before it's considered stale. Reads whatever was saved
 *   under that key:
 *     If nothing was ever saved there, returns null.
 *     If what's saved is older than maxAgeMs, treats it as expired and
 *       returns null (does not delete it, just ignores it).
 *     Otherwise returns the originally saved data as-is.
 *   Any read/parse failure also returns null, same as "nothing cached."
 *
 * Callers (e.g. fetchData.js) are expected to treat a null return from
 * getCached as a cache miss and fetch fresh data instead.
 */
