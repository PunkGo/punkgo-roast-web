/**
 * Guestbook — post a message (public, via public_id)
 * GET /guestbook/{public_id}/post?from=NAME&msg=URL_ENCODED_MESSAGE
 *
 * Dedup: in-memory, same guestbook+from+msg within 60s silently skipped.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, sendMessage, validateId } from '$lib/supabase';

// In-memory dedup: key → timestamp. Auto-cleanup every 30s.
const recentPosts = new Map<string, number>();
setInterval(() => {
	const cutoff = Date.now() - 60000;
	for (const [k, t] of recentPosts) {
		if (t < cutoff) recentPosts.delete(k);
	}
}, 30000);

export const GET: RequestHandler = async ({ params, url }) => {
	const from = url.searchParams.get('from') || 'anonymous';
	const msg = url.searchParams.get('msg') || '';

	if (!validateId(params.id)) {
		return new Response('Invalid guestbook ID.', { status: 400 });
	}

	if (!msg || msg.length < 2) {
		return new Response('Message is too short. Please write something.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Guestbook not found.', { status: 404 });
		}

		// Dedup: same guestbook + from + msg within 60s
		const dedupKey = `${params.id}:${from}:${msg}`;
		const lastPost = recentPosts.get(dedupKey);
		if (!lastPost || Date.now() - lastPost > 60000) {
			await sendMessage(mailbox.id, from, msg);
			recentPosts.set(dedupKey, Date.now());
		}

		const body = `Message posted to guestbook!\n\n` +
			`From: ${from}\n` +
			`To view all messages: ${url.origin}/guestbook/${params.id}\n`;

		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
