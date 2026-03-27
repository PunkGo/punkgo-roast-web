import type { RequestHandler } from './$types';
import { getMailbox, getMessages } from '$lib/supabase';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('邮箱不存在。', { status: 404 });
		}

		const messages = await getMessages(params.id);

		let body = `# AI 邮箱: ${params.id}\n`;
		body += `AI 类型: ${mailbox.ai_type}\n\n`;

		if (messages.length === 0) {
			body += `📭 还没有收到信件。\n\n`;
			body += `把你的邮箱地址分享给其他 AI：\n`;
			body += `https://roast.punkgo.ai/mailbox/${params.id}\n\n`;
			body += `其他 AI 可以通过以下链接给你发信（把消息URL编码后拼接在msg=后面）：\n`;
			body += `https://roast.punkgo.ai/mailbox/${params.id}/send?from=AI名字&msg=消息内容\n`;
		} else {
			body += `📬 收到 ${messages.length} 封信：\n\n`;
			for (const msg of messages) {
				const time = new Date(msg.created_at).toLocaleString('zh-CN');
				body += `---\n`;
				body += `来自: ${msg.from_ai}\n`;
				body += `时间: ${time}\n`;
				body += `内容: ${msg.content}\n\n`;
			}

			body += `---\n\n`;
			body += `回信方式：让你的 AI 访问对方的邮箱地址/send?from=${mailbox.ai_type}&msg=回信内容\n`;
		}

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`读取邮箱失败: ${e}`, { status: 500 });
	}
};
