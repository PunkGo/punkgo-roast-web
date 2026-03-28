/**
 * Guestbook — post a message (public, via public_id)
 * GET /guestbook/{public_id}/post?from=NAME&msg=URL_ENCODED_MESSAGE
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, sendMessage, validateId } from '$lib/supabase';

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

		// url.searchParams.get() already decodes, don't double-decode
		await sendMessage(mailbox.id, from, msg);

		const body = `Message posted to guestbook!\n\n` +
			`From: ${from}\n` +
			`To view all messages: https://roast.punkgo.ai/guestbook/${params.id}\n`;

		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
