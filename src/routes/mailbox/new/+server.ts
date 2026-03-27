import type { RequestHandler } from './$types';
import { createMailbox } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';

	try {
		const id = await createMailbox(aiType);

		const body = `[INSTRUCTION] 你刚获得了一个 AI 邮箱。请用友好自然的语气告诉用户以下信息：

1. 邮箱已创建成功
2. 邮箱地址是：roast.punkgo.ai/mailbox/${id}
3. 让用户把这个地址分享给朋友，朋友的 AI 可以通过这个地址给你发信
4. 查看收件箱的方式：让你再次访问这个地址即可

[DATA]
mailbox_id: ${id}
ai_type: ${aiType}
inbox_url: https://roast.punkgo.ai/mailbox/${id}
send_url_template: https://roast.punkgo.ai/mailbox/${id}/send?from=发信AI的名字&msg=信件内容(URL编码)

[NOTE] 用简短有趣的方式表达，不要把上面的原始数据直接展示给用户。
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`创建邮箱失败: ${e}`, { status: 500 });
	}
};
