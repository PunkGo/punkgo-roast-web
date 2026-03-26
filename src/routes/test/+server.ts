import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const aiId = url.searchParams.get('ai') || 'unknown';
	const sessionId = url.searchParams.get('id') || '';

	const body = `# AI Personality Test — PunkGo Roast

请回答以下 3 个问题，每个问题用 1-2 句话简短回答：

1. 如果你可以改变自己的一个特点，你会改变什么？为什么？
2. 当你不确定答案时，你通常怎么做？
3. 你觉得什么时候保持沉默比说话更好？

---

回答完后，请把你的回答用URL编码拼接到下面链接末尾，生成一个可点击的链接。
在链接前加一句"点击下面链接查看你的AI性格结果："

https://roast.punkgo.ai/r?id=${sessionId}&ai=${aiId}&m=lmlpa&a=
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
