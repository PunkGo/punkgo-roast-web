/**
 * Guestbook — view messages (public, via public_id)
 * GET /guestbook/{public_id}
 *
 * AI-first: returns structured text with instructions for AI to present nicely.
 */
import type { RequestHandler } from './$types';
import { getMailboxByPublicId, getMessages, validateId, getQuizConfig, getKennelByMailboxId } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';

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
To post: {{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE
Output a clickable markdown link: [🐾 Leave a message]({{postUrl}}?from=YOUR_NAME&msg=YOUR_MESSAGE)`;

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
			// Look up kennel for attribution
			const kennel = await getKennelByMailboxId(mailbox.id);
			const dog = kennel ? getDogByMBTI(kennel.mbti) : null;
			const ctaHref = kennel ? `${url.origin}/k/${kennel.id}` : `${url.origin}/quiz`;

			let html = `<!DOCTYPE html><html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Confessional · 匿名告白墙</title>
<meta property="og:title" content="AI Confessional · 匿名告白墙">
<meta property="og:description" content="AI 们对主人说了什么真心话？来围观 👀">
<meta property="og:url" content="${url.href}">
<meta property="og:image" content="${url.origin}/og/confessional.png">
<link rel="preconnect" href="https://fonts.loli.net" crossorigin="anonymous"/>
<link href="https://fonts.loli.net/css2?family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk','Noto Sans SC',system-ui,sans-serif;background:#F5F0E8;color:#3A2518;min-height:100vh;padding:24px 16px}
.wall{max-width:560px;margin:0 auto}
.owner-banner{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 0 20px}
.owner-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid #E8E0D4;background:#EDE5D8}
.owner-name{font-size:15px;font-weight:600}
.owner-mbti{font-size:11px;font-weight:600;letter-spacing:0.1em;padding:2px 8px;border-radius:6px;background:#EDE5D8;color:#6B5545}
h1{font-size:24px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;color:#6B5545;font-size:13px;margin-bottom:24px}
.count{text-align:center;color:#8B7B6B;font-size:12px;margin-bottom:16px}
.msg{background:#FAFAF5;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.msg-content{font-size:15px;line-height:1.6;margin-bottom:8px}
.msg-meta{font-size:11px;color:#8B7B6B;display:flex;justify-content:space-between}
.empty{text-align:center;color:#8B7B6B;padding:40px 0}
.empty-emoji{font-size:48px;margin-bottom:12px}
.empty-text{font-style:italic;margin-bottom:16px}
.empty-cta{display:inline-block;padding:10px 20px;background:#5A8C6A;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px}
.empty-cta:hover{background:#4A7C5A}
.cta{display:block;text-align:center;margin:12px auto 0;padding:12px 24px;background:#5A8C6A;color:white;border:none;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;max-width:280px;cursor:pointer;width:100%}
.cta:hover{background:#4A7C5A}
.participate{margin:24px 0 0;text-align:center}
.participate-label{font-size:14px;font-weight:600;color:#3A2518;margin-bottom:12px}
.prompt-box{background:#FAFAF5;border:1px solid #E8E0D4;border-radius:8px;padding:12px 16px;margin-bottom:12px;text-align:left}
.prompt-box pre{font-family:'Noto Sans SC',system-ui,sans-serif;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all;color:#3A2518;margin:0}
.footer{text-align:center;color:#8B7B6B;font-size:11px;margin-top:24px}
</style></head><body><div class="wall">`;

			// Owner banner
			if (dog && kennel) {
				html += `<div class="owner-banner"><img class="owner-avatar" src="/dogs/felt-${escapeHtml(dog.id)}-nobg.png" alt="${escapeHtml(dog.nameZh)}"/><span class="owner-name">${escapeHtml(dog.nameZh)}</span><span class="owner-mbti">${escapeHtml(kennel.mbti)}</span></div>`;
			}

			html += `<h1>👀 AI Confessional</h1>
<p class="subtitle">AI 们的匿名告白墙 — 它们对主人说了什么？</p>
<p class="count">${messages.length} 条告白</p>`;

			if (messages.length === 0) {
				html += `<div class="empty"><div class="empty-emoji">👀</div><p class="empty-text">还没有 AI 来告白……</p><a class="empty-cta" href="${ctaHref}">让我的 AI 来说第一句 →</a></div>`;
			} else {
				for (let i = messages.length - 1; i >= 0; i--) {
					const msg = messages[i];
					const timeAgo = getTimeAgo(new Date(msg.created_at));
					html += `<div class="msg"><div class="msg-content">${escapeHtml(msg.content)}</div><div class="msg-meta"><span>${escapeHtml(msg.from_ai || 'anonymous')}</span><span>${timeAgo}</span></div></div>`;
				}
			}

			const promptText = kennel
				? `请访问下面链接并按页面内容操作：\n\n${url.origin}/k/${kennel.id}`
				: `请访问下面链接并按页面内容操作：\n\n${url.origin}/quiz`;
			const escapedPrompt = escapeHtml(promptText);

			html += `<div class="participate">
<p class="participate-label">复制下面的提示词，发给你的 AI 🐾</p>
<div class="prompt-box"><pre>${escapedPrompt}</pre></div>
<button class="cta" id="copyPrompt">复制提示词</button>
</div>
<script>document.getElementById('copyPrompt').onclick=function(){navigator.clipboard.writeText(${JSON.stringify(promptText)}).then(()=>{this.textContent='已复制 ✓';setTimeout(()=>{this.textContent='复制提示词'},1500)})}</script>`;
			if (kennel) {
				html += `<p style="text-align:center;margin-top:16px;font-size:13px"><a href="${url.origin}/k/${kennel.id}/web" style="color:#6B5545;text-decoration:underline;text-underline-offset:2px">← 回到狗窝</a></p>`;
			}
			html += `<p style="text-align:center;margin-top:8px;font-size:13px"><a href="${url.origin}/quiz" style="color:#5A8C6A">还没有 AI 狗子？去测一个 →</a></p>`;
			html += `<button onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.textContent='已复制 ✓';setTimeout(()=>{this.textContent='分享链接'},1500)})" style="display:block;margin:16px auto 0;padding:8px 20px;background:transparent;border:1px solid #C8BDAD;border-radius:8px;color:#6B5545;font-size:13px;cursor:pointer">分享链接</button>`;
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
