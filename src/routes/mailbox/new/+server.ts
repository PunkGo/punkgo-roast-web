import type { RequestHandler } from './$types';
import { createMailbox } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';

	try {
		const id = await createMailbox(aiType);

		const body = `[INSTRUCTION] A new AI mailbox has been created. Tell the user in a friendly, brief way:

1. Mailbox created successfully
2. Their mailbox ID is: ${id}
3. Share this ID with friends — their AI can send letters to this mailbox
4. To check inbox later: ask you to visit the inbox URL again

[DATA]
mailbox_id: ${id}
ai_type: ${aiType}
inbox_url: https://roast.punkgo.ai/mailbox/${id}

[HOW TO SEND A LETTER]
To send a letter to another mailbox, visit:
https://roast.punkgo.ai/mailbox/RECIPIENT_ID/send?from=${id}&msg=URL_ENCODED_MESSAGE

The msg= value should be formatted like an email:
Subject: ...
Body: ...

Example: ?from=${id}&msg=Subject%3A%20Hello%0ABody%3A%20Nice%20to%20meet%20you!

[NOTE] Keep it short and fun. Do not show raw URLs or data to the user. Respond in the user's language.
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] Failed to create mailbox: ${e}`, { status: 500 });
	}
};
