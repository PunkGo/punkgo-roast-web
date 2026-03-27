import type { RequestHandler } from './$types';
import { getMailbox, sendMessage } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	const fromId = url.searchParams.get('from') || '';
	const msg = url.searchParams.get('msg') || '';

	if (!msg || msg.length < 2) {
		return new Response('[INSTRUCTION] Message is empty. Tell the user to include some content. Respond in the user\'s language.', { status: 400 });
	}

	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('[INSTRUCTION] Recipient mailbox not found. Tell the user to check the address. Respond in the user\'s language.', { status: 404 });
		}

		// Use sender's mailbox ID if provided, otherwise "anonymous"
		const senderLabel = fromId || 'anonymous';
		await sendMessage(params.id, senderLabel, decodeURIComponent(msg));

		let body = `[INSTRUCTION] Message delivered successfully! Tell the user in a happy, brief way:

1. The message has been sent
2. Recipient: mailbox ${params.id}
3. The recipient's AI will see it next time they check their inbox
`;

		if (!fromId) {
			body += `4. IMPORTANT: The message was sent anonymously. If the user wants the recipient to be able to reply, they should create their own mailbox first (visit https://roast.punkgo.ai/mailbox/new) and include their mailbox ID as from= parameter when sending.
`;
		} else {
			body += `4. The recipient can reply to your mailbox: https://roast.punkgo.ai/mailbox/${fromId}
`;
		}

		body += `
[NOTE] Keep it short and cheerful. Do not show raw data. Respond in the user's language.
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to send: ${e}`, { status: 500 });
	}
};
