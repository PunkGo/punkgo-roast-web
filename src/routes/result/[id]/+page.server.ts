import type { PageServerLoad } from './$types';
import { decodeResultId, getDogByMBTI } from '$lib/data/dogs';
import { generatePersonalityText } from '$lib/llm/deepseek';

export const load: PageServerLoad = async ({ params, request }) => {
	const resultId = params.id;

	try {
		const mbti = decodeResultId(resultId);
		const dog = getDogByMBTI(mbti);

		// Detect locale from Accept-Language header
		const acceptLang = request.headers.get('accept-language') || '';
		const locale: 'en' | 'zh' = acceptLang.includes('zh') ? 'zh' : 'en';

		// Try to generate personalized quip via DeepSeek
		const llmQuip = await generatePersonalityText(
			dog.breed,
			dog.nameZh,
			mbti,
			locale
		);

		return {
			llmQuip: llmQuip || null,
		};
	} catch {
		return {
			llmQuip: null,
		};
	}
};
