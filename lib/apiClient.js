"use client";

// Minimal client-side fetch layer with:
//  - In-flight dedup: identical concurrent requests share one promise.
//  - TTL cache: identical requests within TTL_MS are served from memory.
//  - Invalidation: call apiInvalidate(prefix) after mutations.

const TTL_MS = 60 * 1000;

const cache = new Map(); // url -> { data, fetchedAt }
const inflight = new Map(); // url -> Promise

export async function apiGet(url, { cache: useCache = true, force = false } = {}) {
  if (useCache && !force) {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.fetchedAt < TTL_MS) {
      return hit.data;
    }
  }

  if (inflight.has(url)) {
    return inflight.get(url);
  }

  const promise = (async () => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }

    const data = await res.json();

    if (useCache) {
      cache.set(url, { data, fetchedAt: Date.now() });
    }

    return data;
  })();

  inflight.set(url, promise);

  try {
    return await promise;
  } finally {
    inflight.delete(url);
  }
}

// Read the cached/fetched user payload for an email without mounting the provider.
export const getCachedUser = (email) =>
  email ? apiGet(`/api/users/${encodeURIComponent(email)}`) : Promise.resolve(null);

// Remove every cache entry whose URL starts with the given prefix.
export function apiInvalidate(prefix) {
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function apiClearCache() {
  cache.clear();
  inflight.clear();
}
