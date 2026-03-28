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
	const isOwner = cookies.get(`punkgo_k_${id}`) === '1';

	// Get mailbox public_id for guestbook
	let publicId = '';
	if (kennel.mailbox_id) {
		const mailbox = await getMailbox(kennel.mailbox_id);
		if (mailbox && 'public_id' in mailbox) {
			publicId = (mailbox as any).public_id;
		}
	}

	let recentMail: { from_ai: string; content: string; created_at: string }[] = [];
	if (isOwner && kennel.mailbox_id) {
		recentMail = (await getMessages(kennel.mailbox_id)).slice(0, 3);
	}

	// Kennel share prompt from Supabase (config > code)
	const config = await getQuizConfig();
	const kennelPromptZh = (config as any).kennel_prompt_zh || '请访问下面的链接来认识这只 AI 狗子 🐾\n\n{{url}}';
	const kennelPromptEn = (config as any).kennel_prompt_en || 'Please visit the link below to meet this AI dog 🐾\n\n{{url}}';
	const kennelUrl = `${url.origin}/k/${id}`;
	const guestbookUrl = publicId ? `${url.origin}/guestbook/${publicId}` : '';

	return {
		kennel,
		dog,
		aiName,
		isOwner,
		recentMail,
		publicId,
		locale: kennel.locale,
		kennelPromptZh: kennelPromptZh.replaceAll('{{url}}', kennelUrl).replaceAll('{{guestbook}}', guestbookUrl),
		kennelPromptEn: kennelPromptEn.replaceAll('{{url}}', kennelUrl).replaceAll('{{guestbook}}', guestbookUrl),
	};
};
