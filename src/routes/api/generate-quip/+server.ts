import type { RequestHandler } from './$types';
import { decodeResultId, getDogByMBTI } from '$lib/data/dogs';
import { generatePersonalityText, generateIntroOnly } from '$lib/llm/deepseek';
import { saveResult, getResult } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const resultId = url.searchParams.get('id') || '';
	const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'zh';
	const aiType = url.searchParams.get('ai') || 'unknown';
	const introOnly = url.searchParams.get('intro_only') === '1';

	try {
		const mbti = decodeResultId(resultId);
		const dog = getDogByMBTI(mbti);

		// intro_only mode: quiz already provided the quip, just generate intro phrase
		if (introOnly) {
			const t0 = Date.now();
			const intro = await generateIntroOnly(dog.breed, dog.nameZh, mbti, locale);
			console.log(`[generate-quip] intro_only ${mbti} locale=${locale} latency=${Date.now() - t0}ms`);
			return new Response(JSON.stringify({ quip: null, intro }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check if we already have a stored quip for this result
		const existing = await getResult(resultId);
		if (existing?.quip) {
			return new Response(JSON.stringify({ quip: existing.quip }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Generate new quip + intro
		const t0 = Date.now();
		const result = await generatePersonalityText(dog.breed, dog.nameZh, mbti, locale);
		console.log(`[generate-quip] ${mbti} locale=${locale} latency=${Date.now() - t0}ms quip=${result.quip ? 'ok' : 'null'}`);

		if (result.quip) {
			await saveResult(resultId, mbti, aiType, result.quip);
		}

		return new Response(JSON.stringify({ quip: result.quip || null, intro: result.intro || null }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		console.error(`[generate-quip] error:`, e);
		return new Response(JSON.stringify({ quip: null, intro: null }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
