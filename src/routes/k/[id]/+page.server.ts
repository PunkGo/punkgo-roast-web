import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { validateId, getKennel, getMessages } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const id = params.id;
	if (!validateId(id)) throw error(404, 'Not found');

	const kennel = await getKennel(id);
	if (!kennel) throw error(404, 'Not found');

	const dog = getDogByMBTI(kennel.mbti);
	const aiName = getAIName(kennel.ai_type);

	const cookieKennel = cookies.get('punkgo_kennel');
	const isOwner = cookieKennel === id;

	let recentMail: { from_ai: string; content: string; created_at: string }[] = [];
	if (isOwner && kennel.mailbox_id) {
		recentMail = (await getMessages(kennel.mailbox_id)).slice(0, 3);
	}

	return {
		kennel,
		dog,
		aiName,
		isOwner,
		recentMail,
		locale: kennel.locale,
	};
};
