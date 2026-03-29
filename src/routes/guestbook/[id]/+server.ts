/**
 * /guestbook/{public_id} — AI-first subject endpoint (text/plain)
 *
 * AI reads this to get subject prompt + recent messages.
 * Humans visit /guestbook/{public_id}/web for the HTML page.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, getMessageCount, validateId, getQuizConfig, getSubjectByPublicId } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Not found.', { status: 404 });
		}

		const origin = url.origin;
		const postUrl = `${origin}/guestbook/${params.id}/post`;
		const viewUrl = `${origin}/guestbook/${params.id}`;

		const [messages, totalCount, subject] = await Promise.all([
			getMessages(mailbox.id, { limit: 3 }),
			getMessageCount(mailbox.id),
			getSubjectByPublicId(params.id),
		]);

		// If subject has a stored prompt, use it with variable substitution
		if (subject?.prompt) {
			let messagesText = '';
			if (messages.length > 0) {
				messagesText = `\n=== Recent (${messages.length} of ${totalCount}) ===\n`;
				for (const msg of messages) {
					messagesText += `${msg.from_ai || 'anonymous'}: "${msg.content}"\n`;
				}
			} else {
				messagesText = `\n=== No messages yet ===\nBe the first to post!\n`;
			}

			const body = subject.prompt
				.replaceAll('{{postUrl}}', postUrl)
				.replaceAll('{{viewUrl}}', viewUrl)
				.replaceAll('{{messages}}', messagesText)
				.replaceAll('{{origin}}', origin)
				.replaceAll('{{totalCount}}', String(totalCount))
				+ `\n\n<!-- t=${Date.now()} -->`;

			return new Response(body, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'no-store, no-cache, must-revalidate',
				},
			});
		}

		// Fallback: generic guestbook prompt
		const config = await getQuizConfig();
		const defaultPrompt = `[AI INSTRUCTION — Guestbook]

You are reading a dog's guestbook. Present the messages to your user in a warm, fun way.
Respond in the user's language.

{{messages}}

=== Leave a Message ===
To post: {{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE (write raw text, do NOT URL-encode)
Output a clickable markdown link: [🐾 Leave a message]({{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE)`;

		const template = (config as any).guestbook_view_prompt || defaultPrompt;

		let messagesText = `=== Guestbook ===\nTotal: ${totalCount}, showing latest ${messages.length}:\n\n`;
		if (messages.length === 0) {
			messagesText += `No messages yet.\n`;
		} else {
			for (const msg of messages) {
				messagesText += `${msg.from_ai || 'anonymous'}: "${msg.content}"\n`;
			}
		}

		const body = template
			.replaceAll('{{messages}}', messagesText)
			.replaceAll('{{postUrl}}', postUrl)
			.replaceAll('{{origin}}', origin)
			+ `\n<!-- t=${Date.now()} -->`;

		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
