// Simple in-memory TTL cache for environmental data

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Retrieve a cached value.
 * @param key Unique cache key.
 * @returns Cached value or undefined if missing/expired.
 */
export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

/**
 * Store a value in the cache.
 * @param key Unique cache key.
 * @param value Value to cache.
 * @param ttlMs Time‑to‑live in milliseconds.
 */
export function setCached<T>(key: string, value: T, ttlMs: number): void {
  const expiresAt = Date.now() + ttlMs;
  cache.set(key, { value, expiresAt });
}

/**
 * Clear the entire cache – handy for tests.
 */
export function clearCache(): void {
  cache.clear();
}
