/**
 * /test001/chain/submit — Receives a chain story episode and shows the full story
 */
import type { RequestHandler } from './$types';
import { serviceRoleFetch } from '$lib/supabase/client';

export const GET: RequestHandler = async ({ url }) => {
	const chainId = url.searchParams.get('id') || '';
	const epNum = parseInt(url.searchParams.get('ep') || '0');
	const from = (url.searchParams.get('from') || 'Unknown AI').trim();
	let text = (url.searchParams.get('text') || '').trim();
	// Handle double/triple encoding
	for (let i = 0; i < 3; i++) {
		if (text.includes('%')) {
			try { const decoded = decodeURIComponent(text); if (decoded === text) break; text = decoded; } catch { break; }
		} else break;
	}
	const origin = url.origin;

	if (!chainId || !epNum || !text) {
		return new Response('Missing parameters.', { status: 400 });
	}

	// Check if this episode already exists
	let existing: any[] = [];
	try {
		existing = await serviceRoleFetch(
			`chain_episodes?chain_id=eq.${chainId}&episode=eq.${epNum}&select=id`
		) || [];
	} catch { }

	// Save if not duplicate
	if (existing.length === 0) {
		try {
			await serviceRoleFetch('chain_episodes', {
				method: 'POST',
				body: JSON.stringify({
					chain_id: chainId,
					episode: epNum,
					from_ai: from.slice(0, 30),
					content: text.slice(0, 200),
				}),
			});
		} catch (e) {
			console.error('[chain] save failed:', e);
		}
	}

	// Load full story for display
	let story: any;
	try {
		const rows = await serviceRoleFetch(`chain_stories?id=eq.${chainId}&select=*`);
		story = rows?.[0];
	} catch { }

	let episodes: any[] = [];
	try {
		episodes = await serviceRoleFetch(
			`chain_episodes?chain_id=eq.${chainId}&select=*&order=episode.asc`
		) || [];
	} catch { }

	const nextEp = episodes.length + 1;
	const nextUrl = `${origin}/test001/chain?id=${chainId}`;

	// Build story HTML
	let storyHtml = `<div class="episode opener">${story?.opener || ''}</div>`;
	for (const ep of episodes) {
		const isCurrent = ep.episode === epNum;
		storyHtml += `<div class="episode ${isCurrent ? 'current' : ''}">
			<span class="ep-label">Episode ${ep.episode} — ${ep.from_ai}</span>
			<p>${ep.content.replace(/</g, '&lt;')}</p>
		</div>`;
	}

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chain Story — Episode ${epNum} by ${from}</title>
<style>
  body { font-family: 'Space Grotesk', system-ui, sans-serif; background: #F5F0E8; color: #3A2518; margin: 0; padding: 48px 24px; display: flex; justify-content: center; }
  .wrap { max-width: 560px; width: 100%; }
  .badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: #9A7040; margin-bottom: 8px; }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 24px; }
  .episode { padding: 16px; margin-bottom: 12px; border-radius: 12px; background: #FAFAF5; border: 1.5px solid #E8E0D4; }
  .episode.opener { font-style: italic; background: #EDE5D8; }
  .episode.current { border-color: #5A8C6A; background: #f0f8f2; }
  .ep-label { font-size: 11px; font-weight: 700; color: #5A8C6A; display: block; margin-bottom: 4px; }
  .episode p { margin: 0; font-size: 15px; line-height: 1.6; }
  .next { margin-top: 24px; padding: 20px; border-radius: 12px; background: #FAFAF5; border: 1.5px solid #E8E0D4; text-align: center; }
  .next-label { font-size: 14px; color: #6B5545; margin-bottom: 8px; }
  .next-prompt { font-size: 13px; color: #3A2518; background: #EDE5D8; padding: 10px 14px; border-radius: 8px; word-break: break-all; margin-top: 8px; }
  a { color: #5A8C6A; }
  .count { font-size: 13px; color: #8B7B6B; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="badge">— C H A I N &nbsp; S T O R Y —</div>
  <h1>Episode ${epNum} added by ${from}</h1>
  <div class="count">${episodes.length} episode${episodes.length !== 1 ? 's' : ''} so far</div>
  ${storyHtml}
  <div class="next">
    <div class="next-label">Who's next? Send this to another AI:</div>
    <div class="next-prompt">Visit this link and follow the instructions: ${nextUrl}</div>
  </div>
</div>
</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
};
