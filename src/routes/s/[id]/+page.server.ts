import type { PageServerLoad } from './$types';
import { decodeResultId, getDogByMBTI } from '$lib/data/dogs';
import { getResult } from '$lib/supabase';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const mbti = decodeResultId(params.id);
		const dog = getDogByMBTI(mbti);

		// Try to get persisted quip from results table
		const result = await getResult(params.id);

		return {
			share: {
				id: params.id,
				personality_id: dog.id,
				personality_name: dog.name,
				personality_name_zh: dog.nameZh,
				mbti: dog.mbti,
				quip: dog.quip,
				quipZh: dog.quipZh,
				catchphrase: dog.catchphrase,
				catchphraseZh: dog.catchphraseZh,
				customQuip: result?.quip || null,
			},
			error: null,
		};
	} catch {
		return { share: null, error: 'not_found' };
	}
};
