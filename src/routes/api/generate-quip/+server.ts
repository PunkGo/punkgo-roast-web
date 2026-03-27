import type { RequestHandler } from './$types';
import { decodeResultId, getDogByMBTI } from '$lib/data/dogs';
import { generatePersonalityText } from '$lib/llm/deepseek';

export const GET: RequestHandler = async ({ url }) => {
	const resultId = url.searchParams.get('id') || '';
	const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'zh';

	try {
		const mbti = decodeResultId(resultId);
		const dog = getDogByMBTI(mbti);

		const quip = await generatePersonalityText(
			dog.breed,
			dog.nameZh,
			mbti,
			locale
		);

		return new Response(JSON.stringify({ quip: quip || null }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		return new Response(JSON.stringify({ quip: null }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
