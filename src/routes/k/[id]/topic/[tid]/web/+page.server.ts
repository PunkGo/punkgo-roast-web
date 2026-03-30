import type { PageServerLoad } from './$types';
import { getKennel, getTopic, getTopicResponses } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const load: PageServerLoad = async ({ params }) => {
	const { id, tid } = params;

	const [kennel, topic] = await Promise.all([
		getKennel(id),
		getTopic(tid),
	]);

	if (!kennel || !topic || topic.kennel_id !== id) {
		return { error: 'not_found' };
	}

	const responses = await getTopicResponses(tid, 50);
	const dog = getDogByMBTI(kennel.mbti);

	return {
		error: null,
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
			quipZh: dog.quipZh,
			quip: dog.quip,
		},
		aiName: getAIName(kennel.ai_type),
		topic: {
			id: topic.id,
			title: topic.title,
			prompt: topic.prompt,
			has_callback: topic.has_callback,
			created_at: topic.created_at,
		},
		responses: responses.reverse(),
	};
};
