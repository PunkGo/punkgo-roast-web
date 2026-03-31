/**
 * GET /game/{id}/choose?choice=A — Receive AI choice, advance game, show progress
 *
 * Returns styled HTML progress page with next round's prompt URL.
 */
import type { RequestHandler } from './$types';
import { validateId, getGameSession, advanceGameRound } from '$lib/supabase';
import { ROUNDS, getEnding } from '$lib/data/game-story';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	const origin = url.origin;

	let choice = (url.searchParams.get('choice') || '').trim().toUpperCase();
	// Multi-layer decode
	for (let i = 0; i < 3; i++) {
		if (choice.includes('%')) {
			try { const d = decodeURIComponent(choice); if (d === choice) break; choice = d; } catch { break; }
		} else break;
	}
	choice = choice.replace(/[^A-C]/g, '').slice(0, 1);

	if (!validateId(id) || !choice) {
		return new Response('Invalid parameters. Use ?choice=A, B, or C', { status: 400, headers: { 'Content-Type': 'text/plain' } });
	}

	const session = await getGameSession(id);
	if (!session) {
		return new Response('Game not found.', { status: 404, headers: { 'Content-Type': 'text/plain' } });
	}
	if (session.status === 'completed') {
		return new Response(renderComplete(session, origin), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
	}

	const currentRound = session.current_round;
	const roundData = ROUNDS[currentRound - 1];
	if (!roundData) {
		return new Response('Invalid game state.', { status: 400 });
	}

	// Validate choice exists for this round
	const validChoices = roundData.choices.map(c => c.id);
	if (!validChoices.includes(choice)) {
		return new Response(`Invalid choice "${choice}". Valid: ${validChoices.join(', ')}`, { status: 400, headers: { 'Content-Type': 'text/plain' } });
	}

	// Advance the game
	const updated = await advanceGameRound(id, choice);
	if (!updated) {
		return new Response('Failed to advance game.', { status: 500 });
	}

	const isZh = session.locale === 'zh';
	const choiceDesc = roundData.choices.find(c => c.id === choice);
	const choiceText = choiceDesc ? (isZh ? choiceDesc.zh : choiceDesc.en) : choice;

	// Build progress dots
	let dots = '';
	for (let i = 1; i <= 10; i++) {
		if (i < updated.current_round) {
			dots += `<div class="dot done">${i}</div>`;
		} else if (i === updated.current_round) {
			dots += `<div class="dot current">${i}</div>`;
		} else {
			dots += `<div class="dot">${i}</div>`;
		}
	}

	// Build story log
	let storyLog = '';
	for (let i = 0; i < updated.choices.length; i++) {
		const r = ROUNDS[i];
		const c = updated.choices[i];
		const summary = isZh ? r.summaryZh(c) : r.summaryEn(c);
		const isCurrent = i === updated.choices.length - 1;
		storyLog += `<div class="log-entry ${isCurrent ? 'current' : ''}">
			<span class="log-round">Round ${i + 1}</span>
			<span class="log-choice">${c}</span>
			<p>${summary}</p>
		</div>`;
	}

	// Floor plan
	const floorPlan = roundData.floorPlan(updated.choices);

	// Check if game just completed
	const isComplete = updated.status === 'completed';
	let nextSection = '';

	if (isComplete) {
		const round9Choice = updated.choices[8] || 'C';
		const ending = getEnding(round9Choice, session.ai_name, session.player_name, isZh);
		nextSection = `<div class="ending">
			<h2>${isZh ? '结局' : 'ENDING'}</h2>
			<div class="ending-text">${ending.replace(/\n/g, '<br>')}</div>
		</div>
		<div class="next-prompt">
			<div class="prompt-label">${isZh ? '查看完整记录' : 'View full record'}:</div>
			<div class="prompt-url">${origin}/game/${id}/web</div>
		</div>`;
	} else {
		nextSection = `<div class="next-prompt">
			<div class="prompt-label">${isZh ? '复制下面的链接发给 AI，继续下一轮：' : 'Copy this link to your AI for the next round:'}</div>
			<div class="prompt-url">${isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: '}${origin}/game/${id}?t=${Date.now()}</div>
		</div>`;
	}

	const html = `<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Missing Room — Round ${currentRound} ${isComplete ? '(Complete)' : ''}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
  body { font-family: 'Space Grotesk', system-ui, sans-serif; background: #1a1510; color: #e8dcc8; margin: 0; padding: 48px 24px; display: flex; justify-content: center; }
  .wrap { max-width: 520px; width: 100%; }
  .badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: #c8a060; margin-bottom: 8px; }
  h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #f0e8d8; }
  .meta { font-size: 13px; color: #a89878; margin-bottom: 20px; }
  .progress { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
  .dot { width: 28px; height: 28px; border-radius: 50%; background: #2a2018; border: 1px solid #3a3020; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6a5a48; }
  .dot.done { background: #5a8c6a; color: #fff; border-color: #5a8c6a; }
  .dot.current { background: #c8a060; color: #1a1510; border-color: #c8a060; font-weight: 700; }
  .choice-made { padding: 12px 16px; border-radius: 8px; background: #2a2518; border-left: 3px solid #c8a060; font-size: 14px; margin-bottom: 16px; }
  .choice-label { font-size: 11px; font-weight: 600; color: #c8a060; }
  .log-entry { padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: #2a2018; border: 1px solid #3a3020; font-size: 13px; line-height: 1.5; }
  .log-entry.current { border-color: #c8a060; background: #2a2518; }
  .log-round { font-size: 11px; font-weight: 700; color: #5a8c6a; }
  .log-choice { font-size: 11px; font-weight: 700; color: #c8a060; margin-left: 8px; }
  .log-entry p { margin: 4px 0 0; color: #a89878; }
  .floor-plan { font-family: monospace; font-size: 10px; line-height: 1.3; color: #6a8a6a; background: #1a2018; padding: 12px; border-radius: 8px; margin-bottom: 16px; white-space: pre; overflow-x: auto; }
  .next-prompt { padding: 16px; border-radius: 10px; background: #2a2018; border: 1.5px solid #c8a060; text-align: center; margin-top: 24px; }
  .prompt-label { font-size: 13px; color: #a89878; margin-bottom: 8px; }
  .prompt-url { font-size: 12px; color: #f0e8d8; background: #1a1510; padding: 10px; border-radius: 6px; word-break: break-all; user-select: all; }
  .ending { margin-top: 24px; }
  .ending h2 { font-size: 16px; color: #c8a060; margin-bottom: 12px; }
  .ending-text { font-size: 14px; line-height: 1.8; color: #e8dcc8; white-space: pre-line; }
  a { color: #5a8c6a; }
</style>
</head>
<body>
<div class="wrap">
  <div class="badge">— T H E &nbsp; M I S S I N G &nbsp; R O O M —</div>
  <h1>${isComplete ? (isZh ? '调查完成' : 'Investigation Complete') : (isZh ? `第 ${currentRound} 轮完成` : `Round ${currentRound} Complete`)}</h1>
  <div class="meta">${session.ai_name} & ${session.player_name}</div>

  <div class="progress">${dots}</div>

  <div class="choice-made">
    <span class="choice-label">${isZh ? '选择' : 'CHOICE'}: ${choice}</span>
    <p style="margin:4px 0 0;color:#e8dcc8;font-size:13px;">${choiceText}</p>
  </div>

  <div class="floor-plan">${floorPlan}</div>

  ${storyLog}

  ${nextSection}
</div>
</body>
</html>`;

	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};

function renderComplete(session: any, origin: string): string {
	const isZh = session.locale === 'zh';
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Game Complete</title></head><body style="background:#1a1510;color:#e8dcc8;font-family:system-ui;padding:48px;text-align:center;">
	<h1>${isZh ? '游戏已结束' : 'Game Complete'}</h1>
	<p><a href="${origin}/game/${session.id}/web" style="color:#5a8c6a;">${isZh ? '查看完整记录' : 'View full record'}</a></p>
	</body></html>`;
}
