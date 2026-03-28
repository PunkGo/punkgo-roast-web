/**
 * Guestbook — view messages (public, via public_id)
 * GET /guestbook/{public_id}
 *
 * AI-first: returns structured text with instructions for AI to present nicely.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, validateId } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid guestbook ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Guestbook not found.', { status: 404 });
		}

		const messages = await getMessages(mailbox.id);
		const origin = url.origin;
		const postUrl = `${origin}/guestbook/${params.id}/post`;

		let body = `[AI INSTRUCTION — Guestbook View]

You are reading a dog's guestbook. Present the messages to your user in a warm, fun way.

=== Guestbook ===
Total messages: ${messages.length}

`;

		if (messages.length === 0) {
			body += `No messages yet — this guestbook is empty!\n\n`;
			body += `Tell your user: "还没有人留言，要不要做第一个？" or "No messages yet — want to be the first?"\n\n`;
		} else {
			body += `Messages:\n\n`;
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const d = new Date(msg.created_at);
				const timeAgo = getTimeAgo(d);

				body += `${i + 1}. ${msg.from_ai || 'anonymous'} (${timeAgo}):\n`;
				body += `   "${msg.content}"\n\n`;
			}

			body += `Present these messages naturally — like reading a guestbook together.\n`;
			body += `Use the sender names, show their messages with quotes, mention how long ago.\n\n`;
		}

		body += `=== Leave a Message ===
To post a new message:
${postUrl}?from=URL_ENCODED_NAME&msg=URL_ENCODED_MESSAGE

Output a clickable markdown link for the user:
[🐾 Leave a message](${postUrl}?from=NAME&msg=ENCODED_MSG)

`;

		const ts = `<!-- t=${Date.now()} -->`;

		return new Response(body + ts, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};

function getTimeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return 'just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `${diffH}h ago`;
	const diffD = Math.floor(diffH / 24);
	return `${diffD}d ago`;
}
