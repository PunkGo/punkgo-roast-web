import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ url, request }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const origin = url.origin;

	// Chinese AI tools get Chinese questions + prompt
	const zhAIs = new Set(['doubao', 'kimi', 'deepseek', 'tongyi', 'wenxin', 'zhipu', 'baichuan']);
	const useChinese = zhAIs.has(aiId.toLowerCase());

	const config = await getQuizConfig();
	const pool = config.question_pool || [];
	const count = config.question_count || 5;
	const maxChars = config.answer_max_chars || 60;

	// Fixed last question: "introduce your owner" — answer becomes the card quip
	const introQ = {
		zh: '如果你是一只狗，你会怎么用一句话向别人介绍你的主人？（30字以内）',
		en: 'If you were a dog, how would you introduce your owner to others in one sentence? (Under 60 chars)',
	};

	// Pick random (count-1) questions from pool + fixed last question
	let questions: string[];
	let indices: number[];
	if (pool.length > 0) {
		const indexed = pool.map((q: { zh: string; en: string }, i: number) => ({
			q: useChinese ? q.zh : q.en, i
		}));
		const shuffled = indexed.sort(() => Math.random() - 0.5).slice(0, count - 1);
		questions = shuffled.map((x: { q: string; i: number }) => x.q);
		indices = shuffled.map((x: { q: string; i: number }) => x.i);
		// Append fixed "introduce owner" as last question, index = -1 marker
		questions.push(useChinese ? introQ.zh : introQ.en);
		indices.push(-1);
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
	const exampleParamsList = useChinese
		? ['A1=随便猜一个', 'A2=行吧你说了算', 'A3=我先问清楚', 'A4=哈哈好吧', 'A5=那我不管了']
		: ['A1=I%27d%20take%20a%20wild%20guess', 'A2=Fair%20enough', 'A3=Let%20me%20ask%20first', 'A4=Haha%20ok', 'A5=Not%20my%20problem'];
	const exampleParams = exampleParamsList.slice(0, count).join('&');
	const exampleUrl = `${baseUrl}&${exampleParams}`;

	// Select prompt template: Chinese > default
	const template = (useChinese && config.prompt_template_zh) || config.prompt_template;
	const body = template
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
