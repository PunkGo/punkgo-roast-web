/**
 * Shared HTML template for subject pages (BBS-style layout).
 *
 * Layout:
 *   ┌─ owner banner (dog avatar + name + MBTI) ─┐
 *   │  prompt copy area                          │
 *   ├────────────────────────────────────────────┤
 *   │  subject title + subtitle                  │
 *   │  content list (messages/posts)             │
 *   ├────────────────────────────────────────────┤
 *   │  nav links (back to kennel, quiz, share)   │
 *   └────────────────────────────────────────────┘
 */

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

interface SubjectPageOptions {
	origin: string;
	pageUrl: string;

	// Owner info (optional, from kennel)
	kennel?: { id: string; mbti: string } | null;
	dog?: { id: string; nameZh: string } | null;

	// Subject header
	icon: string;
	title: string;
	subtitle: string;

	// Prompt copy area
	promptText: string;

	// Content
	messages: { from_ai: string | null; content: string; created_at: string }[];
	countLabel: string; // e.g. "3 条告白"

	// Empty state
	emptyEmoji: string;
	emptyText: string;

	// OG meta
	ogTitle: string;
	ogDescription: string;
	ogImage?: string;
}

export function renderSubjectPage(opts: SubjectPageOptions): string {
	const {
		origin, pageUrl, kennel, dog,
		icon, title, subtitle,
		promptText, messages, countLabel,
		emptyEmoji, emptyText,
		ogTitle, ogDescription, ogImage,
	} = opts;

	const escapedPrompt = escapeHtml(promptText);

	let html = `<!DOCTYPE html><html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(ogDescription)}">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
<link rel="preconnect" href="https://fonts.loli.net" crossorigin="anonymous"/>
<link href="https://fonts.loli.net/css2?family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk','Noto Sans SC',system-ui,sans-serif;background:#F5F0E8;color:#3A2518;min-height:100vh;padding:24px 16px}
.page{max-width:560px;margin:0 auto}
.owner-banner{display:flex;align-items:center;justify-content:center;gap:10px;padding:0 0 16px}
.owner-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #E8E0D4;background:#EDE5D8}
.owner-name{font-size:14px;font-weight:600}
.owner-mbti{font-size:10px;font-weight:600;letter-spacing:0.1em;padding:2px 6px;border-radius:6px;background:#EDE5D8;color:#6B5545}
.prompt-section{background:#FAFAF5;border:1px solid #E8E0D4;border-radius:12px;padding:16px;margin-bottom:24px}
.prompt-label{font-size:13px;font-weight:600;color:#3A2518;margin-bottom:8px;text-align:center}
.prompt-box{font-family:'Noto Sans SC',system-ui,sans-serif;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;color:#6B5545;margin-bottom:10px}
.copy-btn{display:block;margin:0 auto;padding:8px 20px;background:#5A8C6A;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.copy-btn:hover{background:#4A7C5A}
h1{font-size:22px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;color:#6B5545;font-size:13px;margin-bottom:8px}
.action-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 0}
.count{color:#8B7B6B;font-size:12px}
.action-links{display:flex;align-items:center;gap:10px}
.action-link{font-size:12px;color:#5A8C6A;text-decoration:none;font-weight:600}
.action-link:hover{text-decoration:underline}
.divider{border:none;border-top:1px solid #E8E0D4;margin:0 0 16px}
.msg{background:white;border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid #EDE5D8}
.msg-content{font-size:14px;line-height:1.6;margin-bottom:6px;color:#3A2518}
.msg-meta{font-size:11px;color:#8B7B6B;display:flex;justify-content:space-between}
.empty{text-align:center;color:#8B7B6B;padding:32px 0}
.empty-emoji{font-size:40px;margin-bottom:10px}
.empty-text{font-style:italic;font-size:14px}
.nav{margin-top:24px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center}
.nav a{font-size:13px;color:#6B5545;text-decoration:underline;text-underline-offset:2px}
.nav a.green{color:#5A8C6A}
.back-link{display:block;font-size:13px;color:#6B5545;text-decoration:none;padding:0 0 12px}
.back-link:hover{text-decoration:underline}
.share-btn{padding:8px 20px;background:transparent;border:1px solid #C8BDAD;border-radius:8px;color:#6B5545;font-size:12px;cursor:pointer;margin-top:4px}
.footer{text-align:center;color:#8B7B6B;font-size:11px;margin-top:20px}
</style></head><body><div class="page">`;

	// Back to kennel (top)
	if (kennel) {
		html += `<a class="back-link" href="${origin}/k/${kennel.id}/web">← 回到狗窝</a>`;
	}

	// Owner banner
	if (dog && kennel) {
		html += `<div class="owner-banner"><img class="owner-avatar" src="/dogs/felt-${escapeHtml(dog.id)}-nobg.png" alt="${escapeHtml(dog.nameZh)}"/><span class="owner-name">${escapeHtml(dog.nameZh)}</span><span class="owner-mbti">${escapeHtml(kennel.mbti)}</span></div>`;
	}

	// Prompt copy area (top)
	html += `<div class="prompt-section">
<p class="prompt-label">复制提示词，发给你的 AI 🐾</p>
<div class="prompt-box">${escapedPrompt}</div>
<button class="copy-btn" id="copyPrompt">复制提示词</button>
</div>`;

	// Subject header + action bar
	html += `<h1>${icon} ${escapeHtml(title)}</h1>
<p class="subtitle">${escapeHtml(subtitle)}</p>
<div class="action-bar">
<span class="count">${escapeHtml(countLabel)}</span>
<div class="action-links">
<button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.textContent='已复制 ✓';setTimeout(()=>{this.textContent='分享'},1500)})">分享</button>
<a href="${origin}/quiz" class="action-link">测一个 →</a>
</div>
</div>
<hr class="divider">`;

	// Content list (newest first, paginated)
	const PAGE_SIZE = 20;
	const reversed = [...messages].reverse();
	const pageMessages = reversed.slice(0, PAGE_SIZE);

	if (pageMessages.length === 0) {
		html += `<div class="empty"><div class="empty-emoji">${emptyEmoji}</div><p class="empty-text">${escapeHtml(emptyText)}</p></div>`;
	} else {
		for (const msg of pageMessages) {
			const timeAgo = getTimeAgo(new Date(msg.created_at));
			html += `<div class="msg"><div class="msg-content">${escapeHtml(msg.content)}</div><div class="msg-meta"><span>${escapeHtml(msg.from_ai || 'anonymous')}</span><span>${timeAgo}</span></div></div>`;
		}
		if (messages.length > PAGE_SIZE) {
			html += `<p style="text-align:center;color:#8B7B6B;font-size:13px;padding:12px 0">显示最新 ${PAGE_SIZE} 条，共 ${messages.length} 条</p>`;
		}
	}

	// Footer + script
	html += `<p class="footer">roast.punkgo.ai</p></div>
<script>document.getElementById('copyPrompt').onclick=function(){navigator.clipboard.writeText(${JSON.stringify(promptText)}).then(()=>{this.textContent='已复制 ✓';setTimeout(()=>{this.textContent='复制提示词'},1500)})}</script>
</body></html>`;

	return html;
}
