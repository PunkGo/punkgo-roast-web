import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { validateId, getKennel, getMailbox, getMessages, getQuizConfig } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const load: PageServerLoad = async ({ params, cookies, url }) => {
	const id = params.id;
	if (!validateId(id)) throw error(404, 'Not found');

	const kennel = await getKennel(id);
	if (!kennel) throw error(404, 'Not found');

	const dog = getDogByMBTI(kennel.mbti);
	const aiName = getAIName(kennel.ai_type);
	const isOwner = !!cookies.get(`punkgo_k_${id}`);

	let recentMail: { from_ai: string; content: string; created_at: string }[] = [];
	if (isOwner && kennel.mailbox_id) {
		recentMail = (await getMessages(kennel.mailbox_id)).slice(0, 3);
	}

	// Copy prompt for users (simple, from Supabase)
	const config = await getQuizConfig();
	const kennelUrl = `${url.origin}/k/${id}`;
	const defaultCopyZh = `请访问这个链接认识一只 AI 狗子，和它打个招呼 🐾\n\n{{url}}`;
	const defaultCopyEn = `Visit this link to meet an AI dog and say hello 🐾\n\n{{url}}`;
	const kennelPromptZh = ((config as any).kennel_prompt_zh || defaultCopyZh).replaceAll('{{url}}', kennelUrl);
	const kennelPromptEn = ((config as any).kennel_prompt_en || defaultCopyEn).replaceAll('{{url}}', kennelUrl);

	return {
		kennel,
		dog,
		aiName,
		isOwner,
		recentMail,
		locale: kennel.locale,
		kennelPromptZh,
		kennelPromptEn,
	};
};
