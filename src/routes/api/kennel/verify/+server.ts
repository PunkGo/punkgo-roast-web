/**
 * GET /api/kennel/verify?code=XXXXXXXXXXXX
 *
 * Verify recovery code → return kennel info + dog data + existing topics.
 * Used by /workshop to authenticate kennel owners.
 */
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getKennelByRecoveryCode, getTopicsByKennel } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const GET: RequestHandler = async ({ url }) => {
	const rawCode = url.searchParams.get('code') || '';
	const code = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

	if (code.length !== 12) {
		return json({ error: 'Invalid code format' }, { status: 400 });
	}

	// Format as XXXX-XXXX-XXXX for DB lookup
	const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
	const kennel = await getKennelByRecoveryCode(formatted);

	if (!kennel) {
		return json({ error: 'Invalid recovery code' }, { status: 403 });
	}

	const dog = getDogByMBTI(kennel.mbti);
	const topics = await getTopicsByKennel(kennel.id);

	return json({
		kennel: {
			id: kennel.id,
			nickname: kennel.nickname,
			mbti: kennel.mbti,
			locale: kennel.locale,
			ai_type: kennel.ai_type,
		},
		dog: {
			name: dog.name,
			nameZh: dog.nameZh,
			breed: dog.breed,
			breedZh: dog.breedZh,
		},
		topics: topics.map(t => ({ id: t.id, title: t.title })),
	});
};
