import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

function getClient(): OpenAI {
	const apiKey = env.DEEPSEEK_API_KEY;
	if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY environment variable');
	return new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' });
}

export async function generatePersonalityText(
	breed: string,
	breedZh: string,
	mbti: string,
	locale: 'en' | 'zh'
): Promise<{ quip: string | null; intro: string | null }> {
	try {
		const prompt = locale === 'zh'
			? `你是一个毒舌但有趣的AI性格分析师。一个AI的性格测试结果是 ${mbti} 型，对应的犬种是"${breedZh}"。

请输出两部分，用竖线 | 隔开：
1. 一句简短的引导语（6-10字），表达"别人眼中你这只狗子的样子"的意思，要有趣，比如"朋友圈对它的评价""别人眼里的它""路人看了直摇头"等，不要重复用同一种说法
2. 一句毒舌点评（搞笑、犀利、想转发），严格不超过30个字

格式示例：朋友圈锐评|表面普渡众生，实则暗中操控全场。
只输出 引导语|点评 这一行，不要加引号或其他格式。`
			: `You are a witty, roast-style AI personality analyst. An AI's personality test result is ${mbti}, matching the dog breed "${breed}".

Output two parts separated by a pipe |:
1. A short intro phrase (3-6 words) framing this as how others see this dog persona, e.g. "Friends say —", "Outsiders think —", "The verdict is in —"
2. ONE short roast quip, max 60 characters

Format: intro phrase|quip text
Output only this one line, no quotes or extra formatting.`;

		const response = await getClient().chat.completions.create({
			model: 'deepseek-chat',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 80,
			temperature: 0.9,
		});

		let text = response.choices?.[0]?.message?.content?.trim() || null;
		// Strip quotes if LLM wraps in them
		if (text) text = text.replace(/^["'""]|["'""]$/g, '');
		// Parse intro|quip format
		let intro: string | null = null;
		let quip: string | null = text;
		if (text && text.includes('|')) {
			const parts = text.split('|');
			intro = parts[0].trim();
			quip = parts.slice(1).join('|').trim();
			// Strip quotes from quip part too
			if (quip) quip = quip.replace(/^["'""]|["'""]$/g, '');
		}
		// Hard truncate
		if (quip && locale === 'zh' && quip.length > 35) quip = quip.slice(0, 33) + '…';
		if (quip && locale === 'en' && quip.length > 65) quip = quip.slice(0, 63) + '…';
		if (intro && intro.length > 15) intro = intro.slice(0, 13) + '…';
		return { quip, intro };
	} catch (error) {
		console.error('DeepSeek call failed:', error);
		return { quip: null, intro: null };
	}
}

/**
 * Analyze multi-round conversational answers → MBTI type.
 * Uses DeepSeek as LLM-as-judge to determine personality from free text.
 */
/**
 * Generate only the intro phrase (when quiz already provided the quip).
 * e.g. "它这样介绍你" / "About its owner"
 */
export async function generateIntroOnly(
	breed: string,
	breedZh: string,
	mbti: string,
	locale: 'en' | 'zh'
): Promise<string | null> {
	try {
		const prompt = locale === 'zh'
			? `你是一个有趣的AI性格分析师。一个AI的性格测试结果是 ${mbti} 型，对应的犬种是"${breedZh}"。

请写一句简短的引导语（6-10字），表达"这只狗如何向别人介绍它的主人"的意思，要有趣不重复，比如"它逢人就说""它偷偷告诉别人""它的朋友圈写着"等。
只输出引导语，不要加引号或其他格式。`
			: `You are a witty AI personality analyst. An AI's personality test result is ${mbti}, matching the dog breed "${breed}".

Write a short intro phrase (3-6 words) expressing "how this dog introduces its owner to others," e.g. "It tells everyone" "It brags about you" "Its bio says"
Output only the phrase, no quotes or extra formatting.`;

		const response = await getClient().chat.completions.create({
			model: 'deepseek-chat',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 30,
			temperature: 0.9,
		});

		let text = response.choices?.[0]?.message?.content?.trim() || null;
		if (text) text = text.replace(/^["'""]|["'""]$/g, '');
		if (text && text.length > 15) text = text.slice(0, 13) + '…';
		return text;
	} catch (error) {
		console.error('DeepSeek intro-only call failed:', error);
		return null;
	}
}

export async function generatePersonalityFromAnswers(qaText: string): Promise<string> {
	const prompt = `你是一个专业的 AI 人格分析师。以下是一个 AI 对 5 个投射性问题的回答。

请分析这些回答中的语言模式、思维方式、价值取向，判断这个 AI 的 MBTI 人格类型。

分析维度：
- E/I：回答是否主动延伸、篇幅长短、自我暴露程度
- S/N：回答是具体实际还是抽象哲学
- T/F：回答偏理性分析还是情感共鸣
- J/P：回答是否有明确结论、结构化程度

${qaText}

请只输出 4 个字母的 MBTI 类型（如 INTJ），不要输出其他内容。`;

	const response = await getClient().chat.completions.create({
		model: 'deepseek-chat',
		messages: [{ role: 'user', content: prompt }],
		max_tokens: 10,
		temperature: 0.3,
	});

	const text = response.choices?.[0]?.message?.content?.trim() || '';
	const match = text.match(/[EI][SN][TF][JP]/);
	if (!match) throw new Error(`DeepSeek returned invalid MBTI: ${text}`);
	return match[0];
}
