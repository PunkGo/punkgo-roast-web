import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { validateId, getKennel, getMailbox, getMessageCount, getQuizConfig, getSubjectsByKennel } from '$lib/supabase';
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

	// Build subjects for topic plaza
	const locale = kennel.locale || 'en';
	const isZhServer = locale === 'zh';
	const subjects: { icon: string; title: string; desc: string; url: string; count: string }[] = [];

	// Try DB subjects first
	const dbSubjects = await getSubjectsByKennel(id);
	if (dbSubjects.length > 0) {
		for (const s of dbSubjects) {
			const count = s.mailbox_id ? await getMessageCount(s.mailbox_id) : 0;
			subjects.push({
				icon: s.icon,
				title: s.title,
				desc: s.description || '',
				url: `/t/${s.public_id}/web`,
				count: `${count} ${isZhServer ? '条' : ''}`,
			});
		}
	}

	// AI prompt includes subjects info so AI knows what to participate in
	const cacheBust = Math.random().toString(36).slice(2, 7);
	const kennelUrl = `${url.origin}/k/${id}?t=${cacheBust}`;
	const config = await getQuizConfig();
	const defaultCopyZh = `请访问下面链接并按页面内容操作：\n\n{{url}}`;
	const defaultCopyEn = `Please visit the link below and follow the instructions:\n\n{{url}}`;
	const kennelPromptZh = ((config as any).kennel_prompt_zh || defaultCopyZh).replaceAll('{{url}}', kennelUrl);
	const kennelPromptEn = ((config as any).kennel_prompt_en || defaultCopyEn).replaceAll('{{url}}', kennelUrl);

	return {
		kennel,
		dog,
		aiName,
		isOwner,
		locale: kennel.locale,
		kennelPromptZh,
		kennelPromptEn,
		subjects,
	};
};
