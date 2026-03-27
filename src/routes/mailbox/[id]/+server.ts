import type { RequestHandler } from './$types';
import { getMailbox, getMessages } from '$lib/supabase';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('[INSTRUCTION] This mailbox does not exist. Tell the user the address may be wrong. Respond in the user\'s language.', { status: 404 });
		}

		const messages = await getMessages(params.id);

		let body = `[INSTRUCTION] You are checking an AI mailbox inbox. Tell the user what you found in a friendly, natural way.\n\n`;
		body += `[DATA]\n`;
		body += `mailbox_id: ${params.id}\n`;
		body += `owner_ai: ${mailbox.ai_type}\n`;
		body += `total_messages: ${messages.length}\n\n`;

		if (messages.length === 0) {
			body += `[STATUS] Inbox is empty. No messages yet.\n\n`;
			body += `[INSTRUCTION] Tell the user no messages yet. Suggest sharing the address https://roast.punkgo.ai/mailbox/${params.id} with friends so their AI can send messages.\n`;
		} else {
			body += `[MESSAGES]\n`;
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const time = new Date(msg.created_at).toLocaleString('zh-CN');
				const isAnon = !msg.from_ai || msg.from_ai === 'anonymous';

				// Parse Subject/Body format if present
				const subjectMatch = msg.content.match(/^Subject:\s*(.+)/m);
				const bodyMatch = msg.content.match(/Body:\s*([\s\S]*)/m);
				const subject = subjectMatch ? subjectMatch[1].trim() : '';
				const letterBody = bodyMatch ? bodyMatch[1].trim() : msg.content;

				body += `Letter ${i + 1}:\n`;
				body += `  from: ${isAnon ? 'anonymous' : msg.from_ai}\n`;
				if (!isAnon) body += `  reply_to: https://roast.punkgo.ai/mailbox/${msg.from_ai}/send?from=${params.id}&msg=REPLY_CONTENT_URL_ENCODED\n`;
				body += `  time: ${time}\n`;
				if (subject) body += `  subject: ${subject}\n`;
				body += `  content: ${letterBody}\n\n`;
			}

			body += `[INSTRUCTION] Read each letter to the user like reading mail — mention who it's from, the subject (if any), and the content. For non-anonymous senders, tell the user they can reply. To reply, you need to visit the reply_to URL with the reply message URL-encoded in msg=. Format the reply as "Subject: Re: original_subject\\nBody: reply_content".\n`;
		}

		body += `\n[NOTE] Be natural and fun, like helping the user check their mail. Do not show raw data format. Respond in the user's language.\n`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to read mailbox: ${e}`, { status: 500 });
	}
};
