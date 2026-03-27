import type { PageServerLoad } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const load: PageServerLoad = async () => {
	const config = await getQuizConfig();
	return {
		copyPrompt: config.copy_prompt || '把下面这段话发给你的 {{aiName}}：',
		ui: config.ui || {},
	};
};
