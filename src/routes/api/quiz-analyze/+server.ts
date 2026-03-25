import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { computeMBTI, getDogByMBTI, encodeResultId } from '$lib/data/dogs';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { answers, locale } = body;

	if (!answers || !Array.isArray(answers) || answers.length !== 5) {
		return json({ error: 'Must provide exactly 5 answers' }, { status: 422 });
	}

	const questions = new Set(answers.map((a: any) => a.question));
	if (questions.size !== 5 || ![1,2,3,4,5].every(q => questions.has(q))) {
		return json({ error: 'Must answer questions 1-5' }, { status: 422 });
	}

	for (const a of answers) {
		if (!'ABCD'.includes(a.choice)) {
			return json({ error: `Invalid choice: ${a.choice}` }, { status: 422 });
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
	});
};
