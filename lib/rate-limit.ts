interface Entry { count: number; reset: number }

const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes to avoid unbounded growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.reset) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Sliding-window in-memory rate limiter.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

/** Extract the best available client IP from a request. */
export function getIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const TOO_MANY = (retryAfterSec = 60) =>
  new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSec),
    },
  });
