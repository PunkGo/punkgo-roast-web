import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const origin = url.origin;

	const config = await getQuizConfig();

	// Build numbered question list
	const questionList = config.questions
		.map((q: string, i: number) => `${i + 1}. ${q}`)
		.join('\n');

	// Replace template placeholders
	const body = config.prompt_template
		.replace('{{questions}}', questionList)
		.replaceAll('{{origin}}', origin)
		.replaceAll('{{aiId}}', aiId);

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
