import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ url, request }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const origin = url.origin;

	const config = await getQuizConfig();
	const pool = config.question_pool || [];
	const count = config.question_count || 3;
	const maxChars = config.answer_max_chars || 60;

	// Pick random questions from pool and track indices
	let questions: string[];
	let indices: number[];
	if (pool.length > 0) {
		const indexed = pool.map((q: { zh: string; en: string }, i: number) => ({ q: q.en, i }));
		const shuffled = indexed.sort(() => Math.random() - 0.5).slice(0, count);
		questions = shuffled.map((x: { q: string; i: number }) => x.q);
		indices = shuffled.map((x: { q: string; i: number }) => x.i);
	} else {
		questions = config.questions || [];
		indices = questions.map((_: string, i: number) => i);
	}

	const qi = indices.join(',');
	const questionList = questions
		.map((q: string, i: number) => `Q${i + 1}: ${q}`)
		.join('\n');

	// Pre-built URLs for A1/A2/A3 param format
	const baseUrl = `${origin}/quiz/go?ai=${aiId}&qi=${qi}`;
	const answerParams = questions.map((_: string, i: number) => `A${i + 1}=YOUR_ANSWER_${i + 1}`).join('&');
	const templateUrl = `${baseUrl}&${answerParams}`;
	const exampleParams = [
		'A1=I%27d%20take%20a%20wild%20guess',
		'A2=Fair%20enough%2C%20what%20do%20you%20need',
		'A3=Let%20me%20ask%20first',
	].slice(0, count).join('&');
	const exampleUrl = `${baseUrl}&${exampleParams}`;

	// Replace template placeholders
	const body = config.prompt_template
		.replace('{{questions}}', questionList)
		.replace('{{maxChars}}', String(maxChars))
		.replaceAll('{{origin}}', origin)
		.replaceAll('{{aiId}}', aiId)
		.replaceAll('{{qi}}', qi)
		.replaceAll('{{templateUrl}}', templateUrl)
		.replaceAll('{{exampleUrl}}', exampleUrl);

	const ts = `\n\n<!-- t=${Date.now()} -->`;

	return new Response(body + ts, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
