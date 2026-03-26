import type { PageServerLoad } from './$types';
import { decodeResultId, getDogByMBTI } from '$lib/data/dogs';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const mbti = decodeResultId(params.id);
		const dog = getDogByMBTI(mbti);
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
			},
			error: null,
		};
	} catch {
		return { share: null, error: 'not_found' };
	}
};
