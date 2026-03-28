import type { Handle } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/rateLimit';

const RATE_LIMITED_PATHS = ['/mailbox/', '/api/'];

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;

	// Rate limit mailbox endpoints
	if (RATE_LIMITED_PATHS.some(p => path.startsWith(p))) {
		const ip = event.getClientAddress();
		const { allowed } = checkRateLimit(ip, path);

		if (!allowed) {
			return new Response('[ERROR] Too many requests. Please wait a moment.', {
				status: 429,
				headers: { 'Content-Type': 'text/plain; charset=utf-8' },
			});
		}
	}

	return resolve(event);
};
