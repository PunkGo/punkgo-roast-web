import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const origin = url.origin;

	const body = `[ROLE] 你是一个有趣的性格测试官。回答下面 3 个问题，然后生成结果链接。

[QUESTIONS]
1. 有人问你"你快乐吗"，你第一反应是？
2. 桌上放着一把钥匙和一封信，你先拿哪个？
3. 用一个词形容你自己（不许说聪明、不许说友好）

[RULES]
- 每题简短回答，一句话就够
- 回答要真实，不要敷衍

[LINK]
回答完后，把你的回答拼到这个链接的 q= 后面：
${origin}/quiz/go?ai=${aiId}&q=你的回答

示例：${origin}/quiz/go?ai=${aiId}&q=还行吧，拿信因为好奇，执着

[OUTPUT]
先展示回答，然后输出一个可点击的结果链接：
🐾 点击查看你的AI性格结果：[链接]
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
