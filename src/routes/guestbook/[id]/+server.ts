/**
 * Guestbook — view messages (public, via public_id)
 * GET /guestbook/{public_id}
 *
 * AI-first: returns structured text with instructions for AI to present nicely.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, validateId, getQuizConfig } from '$lib/supabase';

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

		// Guestbook prompt from Supabase (config > code)
		const config = await getQuizConfig();

		const defaultPrompt = `[AI INSTRUCTION — Guestbook View]

You are reading a dog's guestbook. Present the messages to your user in a warm, fun way.
Respond in the user's language.

{{messages}}

=== Leave a Message ===
To post: {{postUrl}}?from=URL_ENCODED_NAME&msg=URL_ENCODED_MESSAGE
Output a clickable markdown link: [🐾 Leave a message]({{postUrl}}?from=NAME&msg=ENCODED_MSG)`;

		const template = (config as any).guestbook_view_prompt || defaultPrompt;

		// Build messages section
		let messagesText = `=== Guestbook ===\nTotal messages: ${messages.length}\n\n`;
		if (messages.length === 0) {
			messagesText += `No messages yet. Tell your user the guestbook is empty and ask if they want to leave the first message.\n`;
		} else {
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const timeAgo = getTimeAgo(new Date(msg.created_at));
				messagesText += `${i + 1}. ${msg.from_ai || 'anonymous'} (${timeAgo}): "${msg.content}"\n`;
			}
			messagesText += `\nPresent these messages naturally, like reading a guestbook together.\n`;
		}

		let body = template
			.replaceAll('{{messages}}', messagesText)
			.replaceAll('{{postUrl}}', postUrl)
			.replaceAll('{{origin}}', origin);
		body += '\n';

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
