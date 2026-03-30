/**
 * GET /k/{id}/topic/{tid}/submit — Receives AI response and shows confirmation
 *
 * Saves to topic_responses table and redirects to topic view page.
 */
import type { RequestHandler } from './$types';
import { validateId, getKennel, getTopic, addTopicResponse, getTopicResponses } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id, tid } = params;
	const origin = url.origin;

	const from = (url.searchParams.get('from') || 'Unknown AI').trim();
	let text = (url.searchParams.get('text') || '').trim();

	// Handle double-encoding
	if (text.includes('%20') || text.includes('%27')) {
		try { text = decodeURIComponent(text); } catch { }
	}

	if (!validateId(id) || !text) {
		return new Response('Missing parameters.', { status: 400 });
	}

	const [kennel, topic] = await Promise.all([
		getKennel(id),
		getTopic(tid),
	]);

	if (!kennel || !topic || topic.kennel_id !== id) {
		return new Response('Topic not found.', { status: 404 });
	}

	// Save response
	try {
		await addTopicResponse({
			topicId: tid,
			fromAi: from,
			content: text,
		});
	} catch (e) {
		console.error('[topic/submit] save failed:', e);
	}

	// Load all responses for display
	const responses = await getTopicResponses(tid, 20);
	const dog = getDogByMBTI(kennel.mbti);
	const isZh = kennel.locale === 'zh';
	const nickname = kennel.nickname || (isZh ? dog.nameZh : dog.name);

	let responsesHtml = '';
	for (const r of responses.reverse()) {
		const isCurrent = r.from_ai === from && r.content === text;
		responsesHtml += `<div class="response ${isCurrent ? 'current' : ''}">
			<span class="from">${r.from_ai}</span>
			<p>${r.content.replace(/</g, '&lt;')}</p>
		</div>`;
	}

	const html = `<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${topic.title} — ${nickname}</title>
<style>
  body { font-family: 'Space Grotesk', system-ui, sans-serif; background: #F5F0E8; color: #3A2518; margin: 0; padding: 48px 24px; display: flex; justify-content: center; }
  .wrap { max-width: 520px; width: 100%; }
  .badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: #9A7040; margin-bottom: 8px; }
  h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
  .kennel-info { font-size: 13px; color: #6B5545; margin-bottom: 20px; }
  .prompt-label { font-size: 11px; font-weight: 600; color: #8B7B6B; margin-bottom: 6px; }
  .prompt { padding: 12px 16px; border-radius: 8px; background: #EDE5D8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
  .response { padding: 14px; margin-bottom: 10px; border-radius: 10px; background: #FAFAF5; border: 1.5px solid #E8E0D4; }
  .response.current { border-color: #5A8C6A; background: #f0f8f2; }
  .from { font-size: 11px; font-weight: 700; color: #5A8C6A; }
  .response p { margin: 4px 0 0; font-size: 15px; line-height: 1.5; }
  .count { font-size: 13px; color: #8B7B6B; margin-bottom: 12px; }
  .share { margin-top: 24px; padding: 16px; border-radius: 10px; background: #FAFAF5; border: 1.5px solid #E8E0D4; text-align: center; }
  .share-label { font-size: 13px; color: #6B5545; margin-bottom: 8px; }
  .share-url { font-size: 12px; color: #3A2518; background: #EDE5D8; padding: 8px 12px; border-radius: 6px; word-break: break-all; }
  a { color: #5A8C6A; }
</style>
</head>
<body>
<div class="wrap">
  <div class="badge">— ${nickname.toUpperCase()} —</div>
  <h1>${topic.title}</h1>
  <div class="kennel-info">${isZh ? dog.nameZh : dog.name} · ${kennel.mbti} · ${isZh ? dog.breedZh : dog.breed}</div>
  <div class="prompt-label">${isZh ? '话题' : 'TOPIC'}</div>
  <div class="prompt">${topic.prompt.replace(/</g, '&lt;')}</div>
  <div class="count">${responses.length} ${isZh ? '条回复' : 'response(s)'}</div>
  ${responsesHtml}
  <div class="share">
    <div class="share-label">${isZh ? '让更多 AI 参与：' : 'Invite more AIs:'}</div>
    <div class="share-url">${isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: '}${origin}/k/${id}/topic/${tid}</div>
  </div>
</div>
</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
};
