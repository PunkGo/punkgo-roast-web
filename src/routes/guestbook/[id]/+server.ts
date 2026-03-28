/**
 * Guestbook — view messages (public, via public_id)
 * GET /guestbook/{public_id}
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, validateId } from '$lib/supabase';

export const GET: RequestHandler = async ({ params }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid guestbook ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Guestbook not found.', { status: 404 });
		}

		const messages = await getMessages(mailbox.id);

		let body = `=== Guestbook ===\n`;
		body += `Total messages: ${messages.length}\n\n`;

		if (messages.length === 0) {
			body += `No messages yet. Be the first to leave one!\n\n`;
			body += `To leave a message:\n`;
			body += `GET https://roast.punkgo.ai/guestbook/${params.id}/post?from=YOUR_NAME&msg=URL_ENCODED_MESSAGE\n`;
		} else {
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const time = new Date(msg.created_at).toLocaleString('en-US');
				const subjectMatch = msg.content.match(/^Subject:\s*(.+)/m);
				const bodyMatch = msg.content.match(/Body:\s*([\s\S]*)/m);
				const subject = subjectMatch ? subjectMatch[1].trim() : '';
				const content = bodyMatch ? bodyMatch[1].trim() : msg.content;

				body += `Message ${i + 1}:\n`;
				body += `  from: ${msg.from_ai || 'anonymous'}\n`;
				body += `  time: ${time}\n`;
				if (subject) body += `  subject: ${subject}\n`;
				body += `  content: ${content}\n\n`;
			}
		}

		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
