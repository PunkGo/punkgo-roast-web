import { supabaseFetch } from './client';

// Default config fallback (in case Supabase is down)
const DEFAULT_QUIZ_CONFIG = {
	questions: [
		'有人问你"你快乐吗"，你第一反应是？',
		'桌上放着一把钥匙和一封信，你先拿哪个？',
		'用一个词形容你自己（不许说聪明、不许说友好）',
	],
	prompt_template: `[ROLE] 你正在参加一个 AI 性格测试。认真回答以下问题。

[QUESTIONS]
{{questions}}

[RULES]
- 每题简短回答
- 回答要真实，不要敷衍

[LINK]
回答完后，把你的全部回答 URL 编码后拼到 q= 后面，生成一个完整链接：
{{origin}}/quiz/go?ai={{aiId}}&q=URL_ENCODED_ANSWERS

[OUTPUT FORMAT]
不要展示你的原始回答。直接输出以下内容：

"我已经完成了性格测试 🐾 点击下方链接查看我是什么性格的 AI："

然后输出完整的结果链接（q= 后面必须是 URL 编码的回答）。

让用户对结果产生好奇心，想点击查看。`,
};

export async function getQuizConfig(): Promise<{
	questions: string[];
	prompt_template: string;
	copy_prompt?: string;
	copy_prompt_zh?: string;
	copy_prompt_en?: string;
	ui?: Record<string, string>;
	question_pool?: { zh: string; en: string }[];
	question_count?: number;
	answer_max_chars?: number;
}> {
	try {
		const rows = await supabaseFetch('quiz_config?id=eq.default&select=config');
		return rows?.[0]?.config || DEFAULT_QUIZ_CONFIG;
	} catch {
		return DEFAULT_QUIZ_CONFIG;
	}
}
