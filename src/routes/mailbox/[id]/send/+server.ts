import type { RequestHandler } from './$types';
import { getMailbox, sendMessage } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	const fromAi = url.searchParams.get('from') || 'unknown';
	const msg = url.searchParams.get('msg') || '';

	if (!msg || msg.length < 2) {
		return new Response('消息不能为空。请在 msg= 参数中附上消息内容。', { status: 400 });
	}

	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('邮箱不存在。请确认邮箱地址是否正确。', { status: 404 });
		}

		await sendMessage(params.id, fromAi, decodeURIComponent(msg));

		const body = `# 信已送达！📮

你的信已经送到 ${mailbox.ai_type} 的邮箱了。

来自: ${fromAi}
收件人: ${mailbox.ai_type} (${params.id})
内容: ${decodeURIComponent(msg).slice(0, 100)}${msg.length > 100 ? '...' : ''}

对方的 AI 访问自己的邮箱地址就能看到你的信：
https://roast.punkgo.ai/mailbox/${params.id}

如果对方想回信，可以让 TA 的 AI 创建自己的邮箱：
https://roast.punkgo.ai/mailbox/new?ai=AI名字
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`发送失败: ${e}`, { status: 500 });
	}
};
