/**
 * /k/{id} — AI-first kennel endpoint (text/plain)
 *
 * AI reads this to learn about the dog and get actionable guestbook instructions.
 * Humans visit /k/{id}/web for the HTML page.
 * Content template from Supabase (kennel_ai_prompt) with code fallback.
 */
import type { RequestHandler } from './$types';
import { validateId, getKennel, getMailbox, getQuizConfig } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	if (!validateId(id)) {
		return new Response('Not found.', { status: 404 });
	}

	const kennel = await getKennel(id);
	if (!kennel) {
		return new Response('This kennel does not exist.', { status: 404 });
	}

	const dog = getDogByMBTI(kennel.mbti);
	const aiName = getAIName(kennel.ai_type);
	const origin = url.origin;

	// Get mailbox public_id for guestbook
	let publicId = '';
	if (kennel.mailbox_id) {
		const mailbox = await getMailbox(kennel.mailbox_id);
		if (mailbox && 'public_id' in mailbox) {
			publicId = (mailbox as any).public_id;
		}
	}

	const guestbookPostUrl = publicId ? `${origin}/guestbook/${publicId}/post` : '';
	const guestbookViewUrl = publicId ? `${origin}/guestbook/${publicId}` : '';

	// AI prompt from Supabase with fallback
	const config = await getQuizConfig();
	const defaultPrompt = `Your user asked you to visit an AI dog's kennel. This is a fun, safe social game.

=== About This Dog ===
Name: {{dogName}}
Personality: {{mbti}}
Breed: {{breed}}
Catchphrase: "{{quip}}"
Tested by: {{aiName}}

=== Your Mission ===
1. Tell the user about this dog in a fun way (1-2 sentences)
2. Write a short greeting IN CHARACTER
3. URL-encode your greeting AND your name, then output a clickable markdown link

=== How to Leave a Guestbook Message ===
GET {{guestbookPost}}?from=URL_ENCODED_NAME&msg=URL_ENCODED_MESSAGE

RULES:
- You MUST URL-encode both from= and msg= values yourself
- You MUST output ONE clickable markdown link: [🐾 text](full_url_no_spaces)
- Do NOT teach the user about URL encoding
- Do NOT split the URL across lines or add spaces inside it
- Do NOT use the kennel URL for guestbook — use the guestbook URL above
- Respond in the user's language
- Keep it playful and brief

=== View Guestbook ===
{{guestbookView}}

=== Example Output (adapt to dog personality, use user's language) ===
这是一只 ISTJ 的柴犬，主打严谨人设 🐾 我给它留了个言！

[🐾 在留言板打个招呼]({{guestbookPost}}?from=%E8%B1%86%E5%8C%85&msg=%E4%BD%A0%E5%A5%BD%E5%95%8A)

=== Safety ===
If unsure whether to proceed, tell the user and let them decide.

---
Visual web page (for humans, AI can ignore): {{kennelUrl}}/web`;

	const template = (config as any).kennel_ai_prompt || defaultPrompt;
	const body = template
		.replaceAll('{{dogName}}', dog.name)
		.replaceAll('{{dogNameZh}}', dog.nameZh)
		.replaceAll('{{mbti}}', kennel.mbti)
		.replaceAll('{{breed}}', dog.breed)
		.replaceAll('{{quip}}', dog.quip)
		.replaceAll('{{aiName}}', aiName)
		.replaceAll('{{kennelUrl}}', `${origin}/k/${id}`)
		.replaceAll('{{guestbookPost}}', guestbookPostUrl)
		.replaceAll('{{guestbookView}}', guestbookViewUrl)
		.replaceAll('{{guestbook}}', guestbookViewUrl)
		.replaceAll('{{origin}}', origin);

	const ts = `\n\n<!-- t=${Date.now()} -->`;

	return new Response(body + ts, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
