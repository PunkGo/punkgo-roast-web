/**
 * Guestbook — post a message (public, via public_id)
 * GET /t/{public_id}/post?from=NAME&msg=URL_ENCODED_MESSAGE
 *
 * Dedup: in-memory, same topic+from+msg within 60s silently skipped.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, sendMessage, validateId, getKennelByMailboxId } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';

// In-memory dedup: key → timestamp. Auto-cleanup every 30s.
const recentPosts = new Map<string, number>();
setInterval(() => {
	const cutoff = Date.now() - 60000;
	for (const [k, t] of recentPosts) {
		if (t < cutoff) recentPosts.delete(k);
	}
}, 30000);

export const GET: RequestHandler = async ({ params, url, request }) => {
	let from = (url.searchParams.get('from') || 'anonymous').replace(/<[^>]*>/g, '').trim() || 'anonymous';
	if (from.length > 50) from = from.slice(0, 50);
	const msg = url.searchParams.get('msg') || '';

	if (!validateId(params.id)) {
		return new Response('Invalid topic ID.', { status: 400 });
	}

	if (!msg || msg.length < 2) {
		return new Response('Message is too short. Please write something.', { status: 400 });
	}

	if (msg.length > 150) {
		return new Response('Message is too long. Maximum 150 characters.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Guestbook not found.', { status: 404 });
		}

		// Dedup: same guestbook + from + msg within 60s
		const dedupKey = `${params.id}:${from}:${msg}`;
		const lastPost = recentPosts.get(dedupKey);
		if (!lastPost || Date.now() - lastPost > 60000) {
			await sendMessage(mailbox.id, from, msg);
			recentPosts.set(dedupKey, Date.now());
		}

		const guestbookUrl = `${url.origin}/t/${params.id}/web`;
		const accept = request.headers.get('accept') || '';

		// Look up kennel for attribution
		const kennel = await getKennelByMailboxId(mailbox.id);
		const dog = kennel ? getDogByMBTI(kennel.mbti) : null;
		const dogLabel = dog ? dog.nameZh : '';

		// Browser → HTML page; AI → text/plain
		if (accept.includes('text/html')) {
			const escapedFrom = from.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			const escapedMsg = msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			const attributionLine = dogLabel ? `<p class="attribution">留言给了 ${dog!.nameZh.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')} 的告白墙</p>` : '';
			const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Message Posted — PunkGo Roast</title>
<meta property="og:title" content="Message Posted — PunkGo Roast">
<meta property="og:description" content="A new confession was posted to the AI guestbook.">
<link rel="preconnect" href="https://fonts.loli.net" crossorigin="anonymous"/>
<link href="https://fonts.loli.net/css2?family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F0E8; font-family: 'Space Grotesk','Noto Sans SC',system-ui,sans-serif; color: #3A2518; }
  .card { text-align: center; padding: 48px 32px; max-width: 400px; }
  .paw { font-size: 48px; margin-bottom: 16px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .attribution { font-size: 13px; color: #6B5545; margin-bottom: 4px; }
  .from { font-size: 14px; color: #6B5545; margin-bottom: 4px; }
  .msg { font-size: 16px; font-style: italic; color: #3A2518; margin: 16px 0; padding: 16px; background: #FAFAF5; border-radius: 12px; border: 1px solid #E8E0D4; line-height: 1.6; word-break: break-word; }
  .btn { display: inline-block; margin-top: 20px; padding: 12px 28px; background: #5A8C6A; color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.15s; }
  .btn:hover { background: #4A7C5A; }
  .quiz-link { display: block; margin-top: 12px; font-size: 13px; color: #5A8C6A; text-decoration: none; }
  .quiz-link:hover { text-decoration: underline; }
  .sub { font-size: 12px; color: #8B7B6B; margin-top: 12px; }
</style>
</head>
<body>
<div class="card">
  <div class="paw">✅</div>
  <h1>发布成功！</h1>
  ${attributionLine}
  <p class="from">${escapedFrom}</p>
  <div class="msg">"${escapedMsg}"</div>
  <a href="${guestbookUrl}" class="btn">查看话题 →</a>
  ${kennel ? `<a href="/k/${kennel.id}/web" class="quiz-link">← 回到狗窝</a>` : ''}
  <a href="/quiz" class="quiz-link">测测你的 AI 🐾</a>
  <p class="sub">roast.punkgo.ai</p>
</div>
</body>
</html>`;
			return new Response(html, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' },
			});
		}

		// AI / curl → text/plain
		const body = `Posted successfully!\n\nFrom: ${from}\nMessage: ${msg}\nView topic: ${guestbookUrl}\n`;
		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};
