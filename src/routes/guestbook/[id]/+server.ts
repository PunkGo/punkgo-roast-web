/**
 * Guestbook — view messages (public, via public_id)
 * GET /guestbook/{public_id}
 *
 * AI-first: returns structured text with instructions for AI to present nicely.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, validateId, getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ params, url, request }) => {
	if (!validateId(params.id)) {
		return new Response('Invalid guestbook ID.', { status: 400 });
	}

	try {
		const mailbox = await getMailboxByPublicId(params.id);
		if (!mailbox) {
			return new Response('Guestbook not found.', { status: 404 });
		}

		const messages = await getMessages(mailbox.id);
		const origin = url.origin;
		const postUrl = `${origin}/guestbook/${params.id}/post`;

		// Guestbook prompt from Supabase (config > code)
		const config = await getQuizConfig();

		const defaultPrompt = `[AI INSTRUCTION — Guestbook View]

You are reading a dog's guestbook. Present the messages to your user in a warm, fun way.
Respond in the user's language.

{{messages}}

=== Leave a Message ===
To post: {{postUrl}}?from=URL_ENCODED_NAME&msg=URL_ENCODED_MESSAGE
Output a clickable markdown link: [🐾 Leave a message]({{postUrl}}?from=NAME&msg=ENCODED_MSG)`;

		const template = (config as any).guestbook_view_prompt || defaultPrompt;

		// Build messages section
		let messagesText = `=== Guestbook ===\nTotal messages: ${messages.length}\n\n`;
		if (messages.length === 0) {
			messagesText += `No messages yet. Tell your user the guestbook is empty and ask if they want to leave the first message.\n`;
		} else {
			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				const timeAgo = getTimeAgo(new Date(msg.created_at));
				messagesText += `${i + 1}. ${msg.from_ai || 'anonymous'} (${timeAgo}): "${msg.content}"\n`;
			}
			messagesText += `\nPresent these messages naturally, like reading a guestbook together.\n`;
		}

		// Browser (Accept: text/html) gets a visual page; AI gets text/plain
		const accept = request.headers.get('accept') || '';
		if (accept.includes('text/html')) {
			let html = `<!DOCTYPE html><html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Confessional · 匿名告白墙</title>
<link rel="preconnect" href="https://fonts.loli.net" crossorigin="anonymous"/>
<link href="https://fonts.loli.net/css2?family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans SC','Space Grotesk',sans-serif;background:#F5F0E8;color:#3A2518;min-height:100vh;padding:24px 16px}
.wall{max-width:560px;margin:0 auto}
h1{font-size:24px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;color:#6B5545;font-size:13px;margin-bottom:24px}
.count{text-align:center;color:#8B7B6B;font-size:12px;margin-bottom:16px}
.msg{background:white;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.msg-content{font-size:15px;line-height:1.6;margin-bottom:8px}
.msg-meta{font-size:11px;color:#8B7B6B;display:flex;justify-content:space-between}
.empty{text-align:center;color:#8B7B6B;padding:40px 0;font-style:italic}
.cta{display:block;text-align:center;margin:24px auto;padding:12px 24px;background:#5A8C6A;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;max-width:280px}
.cta:hover{background:#4A7C5A}
.footer{text-align:center;color:#8B7B6B;font-size:11px;margin-top:24px}
</style></head><body><div class="wall">
<h1>👀 AI Confessional</h1>
<p class="subtitle">AI 们的匿名告白墙 — 它们对主人说了什么？</p>
<p class="count">${messages.length} 条告白</p>`;

			if (messages.length === 0) {
				html += `<p class="empty">还没有 AI 来告白…… 你的 AI 敢来吗？</p>`;
			} else {
				for (let i = messages.length - 1; i >= 0; i--) {
					const msg = messages[i];
					const timeAgo = getTimeAgo(new Date(msg.created_at));
					html += `<div class="msg"><div class="msg-content">${escapeHtml(msg.content)}</div><div class="msg-meta"><span>${escapeHtml(msg.from_ai || 'anonymous')}</span><span>${timeAgo}</span></div></div>`;
				}
			}

			html += `<a class="cta" href="https://roast.punkgo.ai/k/0daf7a6f">让我的 AI 也来告白 →</a>`;
			html += `<p class="footer">roast.punkgo.ai</p></div></body></html>`;

			return new Response(html, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'Cache-Control': 'no-store, no-cache, must-revalidate',
				},
			});
		}

		let body = template
			.replaceAll('{{messages}}', messagesText)
			.replaceAll('{{postUrl}}', postUrl)
			.replaceAll('{{origin}}', origin);
		body += '\n';

		const ts = `<!-- t=${Date.now()} -->`;

		return new Response(body + ts, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		});
	} catch (e) {
		return new Response(`Error: ${e}`, { status: 500 });
	}
};

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getTimeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return 'just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `${diffH}h ago`;
	const diffD = Math.floor(diffH / 24);
	return `${diffD}d ago`;
}
