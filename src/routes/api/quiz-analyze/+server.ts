import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { computeMBTI, getDogByMBTI, encodeResultId } from '$lib/data/dogs';

export const POST: RequestHandler = async ({ request }) => {
	let body: { answers?: { question: number; choice: string }[]; locale?: string; aiName?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const { answers, locale } = body;
	const aiName = body.aiName || 'AI';

	if (!answers || !Array.isArray(answers) || answers.length !== 5) {
		return json({ error: 'Must provide exactly 5 answers' }, { status: 422 });
	}

	const questions = new Set(answers.map((a) => a.question));
	if (questions.size !== 5 || ![1,2,3,4,5].every(q => questions.has(q))) {
		return json({ error: 'Must answer questions 1-5' }, { status: 422 });
	}

	for (const a of answers) {
		if (typeof a.question !== 'number' || typeof a.choice !== 'string' || a.choice.length !== 1 || !'ABCD'.includes(a.choice)) {
			return json({ error: `Invalid answer: question=${a.question}, choice=${a.choice}` }, { status: 422 });
		}
	}

	const mbti = computeMBTI(answers);
	const dog = getDogByMBTI(mbti);
	const isZh = locale === 'zh';
	const resultId = encodeResultId(answers);

	return json({
		personality: dog,
		quip: isZh ? dog.quipZh : dog.quip,
		catchphrase: isZh ? dog.catchphraseZh : dog.catchphrase,
		resultId,
		mbti,
		aiName,
	});
};
