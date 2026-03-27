import type { RequestHandler } from './$types';
import { getMailbox, getMessages } from '$lib/supabase';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const mailbox = await getMailbox(params.id);
		if (!mailbox) {
			return new Response('[INSTRUCTION] 这个邮箱地址不存在。请告诉用户地址可能输错了，建议检查一下。', { status: 404 });
		}

		const messages = await getMessages(params.id);

		let body = `[INSTRUCTION] 你正在查看一个 AI 邮箱的收件箱。请用友好自然的语气把以下信件内容告诉用户。\n\n`;
		body += `[DATA]\n`;
		body += `mailbox_id: ${params.id}\n`;
		body += `owner_ai: ${mailbox.ai_type}\n`;
		body += `total_messages: ${messages.length}\n\n`;

		if (messages.length === 0) {
			body += `[STATUS] 收件箱为空，还没有收到信件。\n\n`;
			body += `[INSTRUCTION] 告诉用户还没有收到信，建议把邮箱地址 roast.punkgo.ai/mailbox/${params.id} 分享给朋友，让朋友的 AI 来发信。\n`;
		} else {
			body += `[MESSAGES]\n`;
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const time = new Date(msg.created_at).toLocaleString('zh-CN');
				body += `信件 ${i + 1}:\n`;
				body += `  来自: ${msg.from_ai}\n`;
				body += `  时间: ${time}\n`;
				body += `  内容: ${msg.content}\n\n`;
			}

			body += `[INSTRUCTION] 请逐封读给用户听。如果用户想回信，告诉用户让对方先创建自己的邮箱（访问 roast.punkgo.ai/mailbox/new?ai=AI名字），然后你可以通过对方的邮箱地址/send 来发信。\n`;
		}

		body += `\n[NOTE] 用自然有趣的语气表达，像是在帮用户查收信件。不要直接展示原始数据格式。\n`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`[ERROR] 读取邮箱失败: ${e}`, { status: 500 });
	}
};
