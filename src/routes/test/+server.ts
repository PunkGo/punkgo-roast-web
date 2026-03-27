import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ url, request }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const origin = url.origin;

	const config = await getQuizConfig();
	const pool = config.question_pool || [];
	const count = config.question_count || 3;
	const maxChars = config.answer_max_chars || 60;

	// Detect language from Accept-Language header
	const acceptLang = request.headers.get('accept-language') || '';
	const isZh = acceptLang.includes('zh');

	// Pick random questions from pool
	let questions: string[];
	if (pool.length > 0) {
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		questions = shuffled.slice(0, count).map((q: { zh: string; en: string }) => isZh ? q.zh : q.en);
	} else {
		// Fallback to old fixed questions
		questions = config.questions || [];
	}

	const questionList = questions
		.map((q: string, i: number) => `${i + 1}. ${q}`)
		.join('\n');

	// Replace template placeholders
	const body = config.prompt_template
		.replace('{{questions}}', questionList)
		.replace('{{maxChars}}', String(maxChars))
		.replaceAll('{{origin}}', origin)
		.replaceAll('{{aiId}}', aiId);

	const ts = `\n\n<!-- t=${Date.now()} -->`;

	return new Response(body + ts, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
