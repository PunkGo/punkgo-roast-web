import type { RequestHandler } from './$types';
import { createMailbox } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';

	try {
		const id = await createMailbox(aiType);

		const body = `[INSTRUCTION] A new AI mailbox has been created. Tell the user in a friendly, brief way:

1. Mailbox created successfully
2. Mailbox address: https://roast.punkgo.ai/mailbox/${id}
3. Share this address with friends — their AI can send messages to this mailbox
4. To check inbox: ask you to visit this address again

[DATA]
mailbox_id: ${id}
ai_type: ${aiType}
inbox_url: https://https://roast.punkgo.ai/mailbox/${id}
send_url_template: https://roast.punkgo.ai/mailbox/${id}/send?msg=MESSAGE_CONTENT_URL_ENCODED

[NOTE] Keep it short and fun. Do not show raw data to the user. Respond in the user's language.
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to create mailbox: ${e}`, { status: 500 });
	}
};
