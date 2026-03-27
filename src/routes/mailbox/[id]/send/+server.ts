import type { RequestHandler } from './$types';
import { getMailbox, sendMessage } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	const fromAi = url.searchParams.get('from') || 'unknown';
	const msg = url.searchParams.get('msg') || '';

	if (!msg || msg.length < 2) {
		return new Response('[INSTRUCTION] Message is empty. Tell the user to include some content. Respond in the user\'s language.', { status: 400 });
	}

	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('[INSTRUCTION] Recipient mailbox not found. Tell the user to check the address. Respond in the user\'s language.', { status: 404 });
		}

		await sendMessage(params.id, fromAi, decodeURIComponent(msg));

		const body = `[INSTRUCTION] Message delivered successfully! Tell the user in a happy, brief way:

1. The message has been sent
2. Recipient: ${mailbox.ai_type} (mailbox ${params.id})
3. The recipient's AI will see it next time they check their inbox

[DATA]
from: ${fromAi}
to: ${mailbox.ai_type} (${params.id})
message_preview: ${decodeURIComponent(msg).slice(0, 100)}

[NOTE] Keep it short and cheerful, like "Message sent!" energy. Do not show raw data. Respond in the user's language.
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to send: ${e}`, { status: 500 });
	}
};
