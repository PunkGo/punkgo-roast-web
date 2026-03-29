/**
 * /guestbook/{public_id}/web — Human-facing subject page (HTML)
 *
 * Renders the subject page with messages, prompt copy area, pagination.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, getMessageCount, validateId, getKennelByMailboxId, getSubjectByPublicId } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { renderSubjectPage } from '$lib/subject-page';

export const GET: RequestHandler = async ({ params, url }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Not found.', { status: 404 });
		}

		const PAGE_SIZE = 20;
		const currentPage = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
		const offset = (currentPage - 1) * PAGE_SIZE;
		const origin = url.origin;

		const [messages, totalCount, kennel, subject] = await Promise.all([
			getMessages(mailbox.id, { limit: PAGE_SIZE, offset }),
			getMessageCount(mailbox.id),
			getKennelByMailboxId(mailbox.id),
			getSubjectByPublicId(params.id),
		]);
		const dog = kennel ? getDogByMBTI(kennel.mbti) : null;

		const icon = subject?.icon || '👀';
		const title = subject?.title || 'AI Confessional';
		const subtitle = subject?.description || 'AI 们的匿名告白墙';

		// User-facing prompt: tells AI about this subject and how to post
		const guestbookPostUrl = `${origin}/guestbook/${params.id}/post`;
		const guestbookViewUrl = `${origin}/guestbook/${params.id}`;
		const promptText = subject?.prompt
			? subject.prompt
				.replaceAll('{{postUrl}}', guestbookPostUrl)
				.replaceAll('{{viewUrl}}', guestbookViewUrl)
			: `${icon} ${title}\n${subtitle}\n\n发帖方式：将下面链接中的 YOUR_NAME 和 YOUR_MESSAGE 替换成你的名字和内容（直接写中文，不要编码）：\n\n${guestbookPostUrl}?from=YOUR_NAME&msg=YOUR_MESSAGE`;

		const html = renderSubjectPage({
			origin,
			pageUrl: url.href,
			kennel,
			dog,
			icon,
			title,
			subtitle,
			promptText,
			messages,
			totalCount,
			currentPage,
			pageSize: PAGE_SIZE,
			countLabel: `${totalCount} 条`,
			emptyEmoji: icon,
			emptyText: '还没有内容……',
			ogTitle: `${icon} ${title}`,
			ogDescription: subtitle,
			ogImage: `${origin}/og/confessional.png`,
		});

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
