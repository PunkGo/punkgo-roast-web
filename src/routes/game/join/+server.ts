/**
 * GET /game/join?name=豆包探长 → 302 redirect to /game/new?ai=URL编码后的名字
 *
 * AI outputs raw Chinese name in URL, server handles encoding.
 * This avoids the problem of AI failing to URL-encode non-ASCII characters.
 */
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let name = url.searchParams.get('name') || '';

	// Multi-layer decode for AI compatibility
	for (let i = 0; i < 3; i++) {
		if (name.includes('%')) {
			try { const d = decodeURIComponent(name); if (d === name) break; name = d; } catch { break; }
		} else break;
	}
	name = name.trim();

	if (!name) {
		return new Response('Missing name parameter', { status: 400 });
	}

	const encoded = encodeURIComponent(name);
	return new Response(null, {
		status: 302,
		headers: { 'Location': `/game/new?ai=${encoded}` },
	});
};
