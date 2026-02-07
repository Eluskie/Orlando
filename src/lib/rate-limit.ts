// ---------------------------------------------------------------------------
// In-memory rate limiter
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  /** Maximum number of requests per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Custom error for rate limit violations.
 * Includes retryAfter to set Retry-After header.
 */
export class RateLimitError extends Error {
  public readonly retryAfter: number;

  constructor(retryAfterMs: number) {
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    super(`Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`);
    this.name = "RateLimitError";
    this.retryAfter = retryAfterSeconds;
  }
}

// In-memory store (resets on server restart, which is fine for dev)
const store = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically to prevent memory leaks.
 */
function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 60_000);
}

function getEntry(identifier: string, config: RateLimitConfig): RateLimitEntry {
  const now = Date.now();
  const existing = store.get(identifier);

  if (existing && existing.resetAt > now) {
    return existing;
  }

  // Create new entry
  const entry: RateLimitEntry = {
    count: 0,
    resetAt: now + config.windowMs,
  };
  store.set(identifier, entry);
  return entry;
}

/**
 * Consume a rate limit request for the given identifier.
 * Throws RateLimitError if the limit is exceeded.
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): { remaining: number; resetAt: number } {
  const entry = getEntry(identifier, config);

  if (entry.count >= config.maxRequests) {
    const retryAfterMs = entry.resetAt - Date.now();
    throw new RateLimitError(retryAfterMs);
  }

  entry.count += 1;

  return {
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Check rate limit status without consuming a request.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): { limited: boolean; remaining: number; resetAt: number } {
  const entry = getEntry(identifier, config);
  const limited = entry.count >= config.maxRequests;

  return {
    limited,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}
