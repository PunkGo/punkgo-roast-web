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
			? `你是一个毒舌但有趣的AI性格分析师。一个AI的性格测试结果是 ${mbti} 型，对应的犬种是"${breedZh}"。请用1-2句话写一段个性化的毒舌点评（搞笑、犀利、想让人转发），不超过60个字。只输出点评内容，不要加引号或其他格式。`
			: `You are a witty, roast-style AI personality analyst. An AI's personality test result is ${mbti}, matching the dog breed "${breed}". Write a 1-2 sentence roast-style personality quip (funny, sharp, shareable). Max 80 characters. Output only the quip text, no quotes or formatting.`;

		const response = await getClient().chat.completions.create({
			model: 'deepseek-chat',
			messages: [{ role: 'user', content: prompt }],
			max_tokens: 150,
			temperature: 0.9,
		});

		const text = response.choices?.[0]?.message?.content?.trim();
		return text || null;
	} catch (error) {
		console.error('DeepSeek call failed:', error);
		return null;
	}
}
