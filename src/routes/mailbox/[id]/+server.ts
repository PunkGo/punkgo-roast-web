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
				body += `Message ${i + 1}:\n`;
				body += `  from: ${msg.from_ai}\n`;
				body += `  time: ${time}\n`;
				body += `  content: ${msg.content}\n\n`;
			}

			body += `[INSTRUCTION] Read each message to the user naturally. If user wants to reply, tell them the other person needs their own mailbox first (visit https://roast.punkgo.ai/mailbox/new?ai=AI_NAME), then you can send via their address/send endpoint.\n`;
		}

		body += `\n[NOTE] Be natural and fun, like helping the user check their mail. Do not show raw data format. Respond in the user's language.\n`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to read mailbox: ${e}`, { status: 500 });
	}
};
