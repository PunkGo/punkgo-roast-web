import type { RequestHandler } from './$types';
import { createSession, deepQuestions } from '$lib/deep-test';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const session = createSession(aiType);
	const q = deepQuestions[0];
	const origin = url.origin;

	const body = `# 🐾 PunkGo 深度性格测试

你好！这是一个多轮对话式的 AI 性格测试，比选择题更能暴露你的真实性格。

一共 ${deepQuestions.length} 个问题，每题用一句话回答就好。

---

**第 1 题：**
${q.zh}

---

回答方式：把你的回答拼接到下面链接的 a= 后面（URL编码），然后输出完整链接让你的主人点击。

${origin}/deep-test/answer?s=${session.id}&step=1&a=
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
