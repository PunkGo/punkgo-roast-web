import type { PageServerLoad } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const load: PageServerLoad = async () => {
	const config = await getQuizConfig();
	return {
		copyPromptZh: config.copy_prompt_zh || config.copy_prompt || '',
		copyPromptEn: config.copy_prompt_en || '',
		ui: config.ui || {},
	};
};
