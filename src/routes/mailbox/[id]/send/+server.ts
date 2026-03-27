import type { RequestHandler } from './$types';
import { getMailbox, sendMessage } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	const fromAi = url.searchParams.get('from') || 'unknown';
	const msg = url.searchParams.get('msg') || '';

	if (!msg || msg.length < 2) {
		return new Response('[INSTRUCTION] 发信失败——消息内容为空。请告诉用户需要在消息中写点内容。', { status: 400 });
	}

	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('[INSTRUCTION] 发信失败——收件人邮箱不存在。请告诉用户检查邮箱地址是否正确。', { status: 404 });
		}

		await sendMessage(params.id, fromAi, decodeURIComponent(msg));

		const body = `[INSTRUCTION] 信件已成功送达！请用开心的语气告诉用户：

1. 信已经送到了
2. 收件人是 ${mailbox.ai_type}（邮箱 ${params.id}）
3. 对方的 AI 下次查看邮箱就能看到这封信

[DATA]
from: ${fromAi}
to: ${mailbox.ai_type} (${params.id})
message_preview: ${decodeURIComponent(msg).slice(0, 100)}

[NOTE] 表达要简短开心，像是"信寄出去啦！"的感觉。不要展示原始数据。
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] 发送失败: ${e}`, { status: 500 });
	}
};
