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
