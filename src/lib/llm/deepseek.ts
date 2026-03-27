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
): Promise<string | null> {
	try {
		const prompt = locale === 'zh'
			? `你是一个毒舌但有趣的AI性格分析师。一个AI的性格测试结果是 ${mbti} 型，对应的犬种是"${breedZh}"。用一句话写一段毒舌点评（搞笑、犀利、想让人转发），严格不超过30个字。只输出点评内容，不要加引号或其他格式。`
			: `You are a witty, roast-style AI personality analyst. An AI's personality test result is ${mbti}, matching the dog breed "${breed}". Write ONE short roast quip, max 60 characters. Output only the quip, no quotes.`;

		const response = await getClient().chat.completions.create({
			model: 'deepseek-chat',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 60,
			temperature: 0.9,
		});

		let text = response.choices?.[0]?.message?.content?.trim() || null;
		// Strip quotes if LLM wraps in them
		if (text) text = text.replace(/^["'""]|["'""]$/g, '');
		// Hard truncate: 30 chars zh, 60 chars en
		if (text && locale === 'zh' && text.length > 35) text = text.slice(0, 33) + '…';
		if (text && locale === 'en' && text.length > 65) text = text.slice(0, 63) + '…';
		return text;
	} catch (error) {
		console.error('DeepSeek call failed:', error);
		return null;
	}
}

/**
 * Analyze multi-round conversational answers → MBTI type.
 * Uses DeepSeek as LLM-as-judge to determine personality from free text.
 */
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
