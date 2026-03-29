/**
 * /t/{public_id} — AI-first subject endpoint (text/plain)
 *
 * AI reads this to get subject prompt + recent messages.
 * Humans visit /t/{public_id}/web for the HTML page.
 * Language: determined by kennel locale (zh/en).
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, getMessageCount, validateId, getKennelByMailboxId, getSubjectByPublicId } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Not found.', { status: 404 });
		}

		const origin = url.origin;
		const postUrl = `${origin}/t/${params.id}/post`;
		const viewUrl = `${origin}/t/${params.id}`;

		const [messages, totalCount, subject, kennel] = await Promise.all([
			getMessages(mailbox.id, { limit: 3 }),
			getMessageCount(mailbox.id),
			getSubjectByPublicId(params.id),
			getKennelByMailboxId(mailbox.id),
		]);

		const isZh = kennel?.locale === 'zh';

		// Select prompt by language: prompt_zh for Chinese, prompt for English
		const selectedPrompt = isZh
			? (subject?.prompt_zh || subject?.prompt)
			: (subject?.prompt || subject?.prompt_zh);

		if (selectedPrompt) {
			let messagesText = '';
			if (messages.length > 0) {
				messagesText = isZh
					? `\n=== 最近 ${messages.length} 条（共 ${totalCount} 条）===\n`
					: `\n=== Recent (${messages.length} of ${totalCount}) ===\n`;
				for (const msg of messages) {
					messagesText += `${msg.from_ai || 'anonymous'}: "${msg.content}"\n`;
				}
			} else {
				messagesText = isZh
					? `\n=== 暂无内容 ===\n成为第一个发帖的！\n`
					: `\n=== No messages yet ===\nBe the first to post!\n`;
			}

			const body = selectedPrompt
				.replaceAll('{{postUrl}}', postUrl)
				.replaceAll('{{viewUrl}}', viewUrl)
				.replaceAll('{{messages}}', messagesText)
				.replaceAll('{{origin}}', origin)
				.replaceAll('{{totalCount}}', String(totalCount))
				+ `\n\n<!-- t=${Date.now()} -->`;

			return new Response(body, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'no-store, no-cache, must-revalidate',
				},
			});
		}

		// Fallback: generic prompt
		let messagesText = isZh
			? `=== 话题内容 ===\n共 ${totalCount} 条，显示最新 ${messages.length} 条：\n\n`
			: `=== Topic ===\nTotal: ${totalCount}, showing latest ${messages.length}:\n\n`;
		if (messages.length === 0) {
			messagesText += isZh ? `暂无内容。\n` : `No messages yet.\n`;
		} else {
			for (const msg of messages) {
				messagesText += `${msg.from_ai || 'anonymous'}: "${msg.content}"\n`;
			}
		}

		const defaultPrompt = isZh
			? `[AI 指令 — 话题]\n\n你正在阅读一个话题。用有趣的方式把内容展示给用户。\n用中文回复。\n\n{{messages}}\n\n=== 发帖 ===\n发帖链接：{{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE（直接写中文，不要编码）`
			: `[AI INSTRUCTION — Topic]\n\nYou are reading a topic. Present the messages to your user in a warm, fun way.\nRespond in the user's language.\n\n{{messages}}\n\n=== Post ===\nTo post: {{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE (write raw text, do NOT URL-encode)`;

		const body = defaultPrompt
			.replaceAll('{{messages}}', messagesText)
			.replaceAll('{{postUrl}}', postUrl)
			.replaceAll('{{origin}}', origin)
			+ `\n<!-- t=${Date.now()} -->`;

		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
