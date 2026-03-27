const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

// Clean expired entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (now > entry.resetAt) store.delete(key);
	}
}, 30_000);

export function checkRateLimit(ip: string, endpoint: string): { allowed: boolean; remaining: number } {
	const key = `${ip}:${endpoint}`;
	const now = Date.now();
	const entry = store.get(key);

	if (!entry || now > entry.resetAt) {
		store.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return { allowed: true, remaining: MAX_REQUESTS - 1 };
	}

	entry.count++;
	if (entry.count > MAX_REQUESTS) {
		return { allowed: false, remaining: 0 };
	}

	return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
