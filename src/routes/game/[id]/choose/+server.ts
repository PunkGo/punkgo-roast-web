/**
 * GET /game/{id}/choose?choice=A — Receive AI choice, advance game, show game screen
 *
 * This is the MAIN game interface for humans. Shows:
 * - Scene illustration
 * - Full narrative text
 * - Clue card
 * - AI's choice + reasoning
 * - Progress history
 * - Next round prompt (copy to AI)
 *
 * Idempotent: duplicate submissions return the same page without advancing.
 */
import type { RequestHandler } from './$types';
import { validateId, getGameSession, advanceGameRound } from '$lib/supabase';
import type { GameSession } from '$lib/supabase';
import { ROUNDS, getEnding } from '$lib/data/game-story';
import type { GameRound } from '$lib/data/game-story';
import { escapeHtml } from '$lib/utils/escape';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	const origin = url.origin;

	let choice = (url.searchParams.get('choice') || '').trim().toUpperCase();
	const roundParam = parseInt(url.searchParams.get('round') || '0');
	// Multi-layer decode for AI compatibility (Doubao double-encodes, DeepSeek triple-encodes)
	for (let i = 0; i < 3; i++) {
		if (choice.includes('%')) {
			try { const d = decodeURIComponent(choice); if (d === choice) break; choice = d; } catch { break; }
		} else break;
	}
	choice = choice.replace(/[^A-C]/g, '').slice(0, 1);

	if (!validateId(id) || !choice) {
		return new Response('参数无效 / Invalid parameters. Use ?choice=A, B, or C', { status: 400, headers: { 'Content-Type': 'text/plain' } });
	}

	const session = await getGameSession(id);
	if (!session) {
		return new Response('游戏不存在 / Game not found.', { status: 404, headers: { 'Content-Type': 'text/plain' } });
	}
	if (session.status === 'completed') {
		return new Response(renderComplete(session, origin), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
	}

	const currentRound = session.current_round;
	const roundData = ROUNDS[currentRound - 1];
	if (!roundData) {
		return new Response('游戏状态无效 / Invalid game state.', { status: 400 });
	}

	const validChoices = roundData.choices.map(c => c.id);
	if (!validChoices.includes(choice)) {
		return new Response(`无效选项 / Invalid choice "${choice}". Valid: ${validChoices.join(', ')}`, { status: 400, headers: { 'Content-Type': 'text/plain' } });
	}

	// Idempotency: if round param doesn't match current round, stale request
	if (roundParam > 0 && roundParam !== currentRound) {
		const playedRound = Math.min(roundParam, session.choices.length);
		const playedRoundData = ROUNDS[playedRound - 1] || roundData;
		const existingChoice = session.choices[playedRound - 1] || choice;
		return renderGameScreen(session, playedRound, existingChoice, playedRoundData, origin);
	}

	// Advance (optimistic concurrency)
	const updated = await advanceGameRound(id, choice);
	if (!updated) {
		const fresh = await getGameSession(id);
		if (!fresh) return new Response('游戏不存在 / Game not found.', { status: 404 });
		return renderGameScreen(fresh, currentRound, choice, roundData, origin);
	}

	return renderGameScreen(updated, currentRound, choice, roundData, origin);
};

function renderGameScreen(
	session: GameSession,
	roundPlayed: number,
	choice: string,
	roundData: GameRound,
	origin: string,
): Response {
	const isZh = session.locale === 'zh';
	const safeAiName = escapeHtml(session.ai_name);
	const safePlayerName = escapeHtml(session.player_name);
	const choiceDesc = roundData.choices.find(c => c.id === choice);
	const choiceText = choiceDesc ? (isZh ? choiceDesc.zh : choiceDesc.en) : choice;
	const narrative = isZh ? roundData.narrativeZh : roundData.narrativeEn;
	const clue = isZh ? roundData.clueZh : roundData.clueEn;
	const isComplete = session.status === 'completed';

	// Progress dots
	let dots = '';
	for (let i = 1; i <= 10; i++) {
		if (isComplete) dots += `<div class="dot done">${i}</div>`;
		else if (i < session.current_round) dots += `<div class="dot done">${i}</div>`;
		else if (i === session.current_round) dots += `<div class="dot current">${i}</div>`;
		else dots += `<div class="dot">${i}</div>`;
	}

	// Scene images
	const sceneHtml = roundData.images.length > 0
		? `<div class="scene">${roundData.images.map(img =>
			`<img src="${origin}/game/${img}.jpg" alt="" loading="lazy" />`
		).join('')}</div>`
		: '';

	// Narrative paragraphs
	const narrativeHtml = narrative.split('\n\n').map(p =>
		`<p class="narrative">${p.replace(/\n/g, '<br>')}</p>`
	).join('');

	// Clue card
	const clueHtml = clue
		? `<div class="clue"><span class="clue-label">${isZh ? '线索' : 'CLUE'}</span><p>${clue}</p></div>`
		: '';

	// AI choice badge
	const choiceBadge = `<div class="ai-choice">
		<span class="ai-label">${safeAiName} ${isZh ? '的选择' : 'chose'}</span>
		<span class="ai-pick">${choice}</span>
		<p>${choiceText}</p>
	</div>`;

	// Previous rounds (collapsed)
	let historyHtml = '';
	if (session.choices.length > 1) {
		historyHtml = `<details class="history"><summary>${isZh ? '调查记录' : 'Investigation Log'} (${session.choices.length - 1})</summary>`;
		for (let i = 0; i < session.choices.length - 1; i++) {
			const r = ROUNDS[i];
			const c = session.choices[i];
			const summary = isZh ? r.summaryZh(c) : r.summaryEn(c);
			historyHtml += `<div class="log-entry"><span class="log-round">R${i + 1}</span><span class="log-choice">${c}</span><p>${summary}</p></div>`;
		}
		historyHtml += '</details>';
	}

	// Ending or next round
	let endSection = '';
	if (isComplete) {
		const round9Choice = session.choices[8] || 'C';
		const endingLabel = round9Choice === 'A' ? (isZh ? '完美结局' : 'PERFECT ENDING')
			: round9Choice === 'B' ? (isZh ? '不错的结局' : 'GOOD ENDING')
			: (isZh ? '苦涩的结局' : 'BITTERSWEET ENDING');
		const endingRaw = getEnding(round9Choice, session.ai_name, session.player_name, isZh);
		const ending = escapeHtml(endingRaw);
		const endingParagraphs = ending.split('\n\n').map(p => {
			if (p.includes('═══')) return `<div class="ending-badge">${p.replace(/═/g, '').trim()}</div>`;
			if (p.includes('🏆') || p.includes('恭喜') || p.includes('Well done') || p.includes('干得好'))
				return `<div class="ending-result">${p.trim()}</div>`;
			return `<p class="ending-para">${p.replace(/\n/g, '<br>')}</p>`;
		}).join('');

		// Rating card + ending image
		const cardImg = round9Choice === 'A' ? 'card_a' : round9Choice === 'B' ? 'card_b' : 'card_c';
		const endImg = round9Choice === 'A' ? 'end_a_discovery' : round9Choice === 'B' ? 'end_b_sealed' : 'end_c_exterior_dawn';
		const stars = round9Choice === 'A' ? '★★★' : round9Choice === 'B' ? '★★☆' : '★☆☆';

		endSection = `
		<div class="rating-card">
			<img src="${origin}/game/${cardImg}.jpg" class="card-bg" alt="" />
			<div class="card-overlay">
				<div class="card-stars">${stars}</div>
				<div class="card-label">${endingLabel}</div>
				<div class="card-names">${safeAiName} & ${safePlayerName}</div>
				<div class="card-rounds">roast.punkgo.ai/game</div>
			</div>
		</div>
		<div class="ending-reveal">
			<img src="${origin}/game/${endImg}.jpg" class="ending-img" alt="" />
			${endingParagraphs}
		</div>
		<div class="end-actions">
			<a href="${origin}/game" class="btn-action">${isZh ? '🔄 再来一局' : '🔄 Play Again'}</a>
			<a href="${origin}/game/${session.id}/web" class="btn-action secondary">${isZh ? '📋 完整记录' : '📋 Full Record'}</a>
		</div>`;
	} else {
		const nextUrl = `${isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: '}${origin}/game/${session.id}?t=${Date.now()}`;
		endSection = `<div class="next-round">
			<div class="next-label">${isZh ? `复制发给 ${safeAiName}，继续第 ${session.current_round} 轮` : `Copy & send to ${safeAiName} for Round ${session.current_round}`}</div>
			<textarea class="next-url" readonly onclick="this.select()">${nextUrl}</textarea>
			<button class="btn-copy" onclick="copyNext(this)">${isZh ? '📋 复制发给 AI' : '📋 Copy & send to AI'}</button>
		</div>
		<script>
		function copyNext(btn){
			var text=document.querySelector('.next-url').value;
			if(navigator.clipboard&&navigator.clipboard.writeText){
				navigator.clipboard.writeText(text).then(done).catch(fallback);
			}else{fallback();}
			function fallback(){var ta=document.querySelector('.next-url');ta.select();ta.setSelectionRange(0,99999);document.execCommand('copy');done();}
			function done(){btn.textContent='${isZh ? '✅ 已复制！发给 AI 继续' : '✅ Copied! Send to AI'}';setTimeout(function(){btn.textContent='${isZh ? '📋 复制发给 AI' : '📋 Copy & send to AI'}'},3000);}
		}
		</script>`;
	}

	const html = `<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isComplete ? (isZh ? '调查完成' : 'Case Closed') : `Round ${roundPlayed}`} — The Missing Room</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif; background: #1a1510; color: #e8dcc8; min-height: 100vh; }
.wrap { max-width: 520px; margin: 0 auto; padding: 32px 20px 64px; }

/* Header */
.badge { font-size: 10px; font-weight: 600; letter-spacing: 0.3em; color: #6a5a48; margin-bottom: 4px; }
h1 { font-size: 18px; font-weight: 700; color: #f0e8d8; margin-bottom: 2px; }
.meta { font-size: 12px; color: #8a7a68; margin-bottom: 16px; }

/* Progress */
.progress { display: flex; gap: 4px; margin-bottom: 20px; }
.dot { width: 24px; height: 24px; border-radius: 50%; background: #2a2018; border: 1px solid #3a3020; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #5a4a38; }
.dot.done { background: #5a8c6a; color: #fff; border-color: #5a8c6a; }
.dot.current { background: #c8a060; color: #1a1510; border-color: #c8a060; font-weight: 700; }

/* Scene image */
.scene { margin-bottom: 20px; }
.scene img { width: 100%; border-radius: 10px; display: block; margin-bottom: 8px; }
.scene img:only-child { margin-bottom: 0; }

/* Narrative */
.narrative { font-size: 14px; line-height: 1.8; color: #d8ccb8; margin-bottom: 12px; }

/* Clue */
.clue { padding: 14px 16px; border-radius: 10px; background: #1e2a1e; border-left: 3px solid #5a8c6a; margin: 16px 0; }
.clue-label { font-size: 10px; font-weight: 700; color: #5a8c6a; letter-spacing: 0.1em; display: block; margin-bottom: 6px; }
.clue p { font-size: 13px; line-height: 1.6; color: #a8c8a8; }

/* AI choice */
.ai-choice { padding: 14px 16px; border-radius: 10px; background: #2a2518; border-left: 3px solid #c8a060; margin: 16px 0; }
.ai-label { font-size: 10px; font-weight: 600; color: #8a7a68; }
.ai-pick { font-size: 14px; font-weight: 700; color: #c8a060; margin-left: 8px; }
.ai-choice p { font-size: 13px; color: #d8ccb8; margin-top: 4px; }

/* History */
.history { margin: 16px 0; }
.history summary { font-size: 12px; color: #6a5a48; cursor: pointer; padding: 8px 0; }
.history summary:hover { color: #c8a060; }
.log-entry { padding: 8px 12px; margin: 4px 0; border-radius: 6px; background: #221c14; font-size: 12px; line-height: 1.4; }
.log-round { font-weight: 700; color: #5a8c6a; }
.log-choice { font-weight: 700; color: #c8a060; margin-left: 6px; }
.log-entry p { margin: 2px 0 0; color: #7a6a58; }

/* Next round */
.next-round { margin-top: 24px; padding: 20px; border-radius: 12px; background: #2a2018; border: 1.5px solid #c8a060; text-align: center; }
.next-label { font-size: 13px; color: #a89878; margin-bottom: 10px; font-weight: 600; }
.next-url { font-size: 11px; color: #d8ccb8; background: #1a1510; padding: 10px 12px; border-radius: 8px; word-break: break-all; user-select: all; cursor: pointer; margin-bottom: 12px; line-height: 1.5; width: 100%; border: 1px solid #3a3020; font-family: inherit; resize: none; height: auto; min-height: 60px; }
.btn-copy { width: 100%; padding: 14px; background: #c8a060; color: #1a1510; border: none; border-radius: 99px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
.btn-copy:hover { background: #d8b070; }
.btn-copy:active { transform: scale(0.98); }

/* Rating card */
.rating-card { position: relative; margin: 24px 0; border-radius: 12px; overflow: hidden; }
.card-bg { width: 100%; display: block; }
.card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(26,21,16,0.95)); text-align: center; }
.card-stars { font-size: 28px; color: #c8a060; letter-spacing: 4px; margin-bottom: 4px; }
.card-label { font-size: 14px; font-weight: 700; color: #c8a060; letter-spacing: 0.15em; margin-bottom: 8px; }
.card-names { font-size: 16px; font-weight: 700; color: #f0e8d8; margin-bottom: 4px; }
.card-rounds { font-size: 11px; color: #8a7a68; letter-spacing: 0.05em; }

/* Ending */
.ending-reveal { margin-top: 24px; }
.ending-label { font-size: 12px; font-weight: 700; color: #c8a060; letter-spacing: 0.2em; text-align: center; margin-bottom: 16px; }
.ending-img { width: 100%; border-radius: 12px; margin-bottom: 16px; }
.ending-para { font-size: 14px; line-height: 1.8; color: #d8ccb8; margin-bottom: 12px; padding: 12px 16px; background: #2a2018; border-radius: 10px; border: 1px solid #3a3020; }
.ending-badge { font-size: 13px; font-weight: 700; color: #c8a060; text-align: center; padding: 8px 0; letter-spacing: 0.05em; margin: 12px 0; }
.ending-result { font-size: 14px; font-weight: 600; color: #5a8c6a; text-align: center; padding: 16px; background: #1e2a1e; border-radius: 10px; margin: 8px 0; }

/* End actions */
.end-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-action { flex: 1; padding: 14px; border-radius: 99px; text-align: center; font-size: 14px; font-weight: 700; text-decoration: none; font-family: inherit; }
.btn-action:first-child { background: #c8a060; color: #1a1510; }
.btn-action.secondary { background: #2a2018; color: #c8a060; border: 1.5px solid #c8a060; }

/* Responsive */
@media (max-width: 400px) {
  .wrap { padding: 20px 16px 48px; }
  h1 { font-size: 16px; }
  .narrative { font-size: 13px; }
  .end-actions { flex-direction: column; }
}
</style>
</head>
<body>
<div class="wrap">
  <div class="badge">— T H E &nbsp; M I S S I N G &nbsp; R O O M —</div>
  <h1>${isComplete ? (isZh ? '调查完成' : 'Investigation Complete') : (isZh ? `第 ${roundPlayed} 轮` : `Round ${roundPlayed}`)}</h1>
  <div class="meta">${safeAiName} & ${safePlayerName}</div>

  <div class="progress">${dots}</div>

  ${sceneHtml}

  ${narrativeHtml}

  ${clueHtml}

  ${choiceBadge}

  ${historyHtml}

  ${endSection}
</div>
</body>
</html>`;

	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function renderComplete(session: GameSession, origin: string): string {
	const isZh = session.locale === 'zh';
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Case Closed</title>
<style>body{background:#1a1510;color:#e8dcc8;font-family:'Space Grotesk',system-ui;padding:48px 24px;text-align:center;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
h1{font-size:24px;margin-bottom:16px;color:#c8a060}a{color:#5a8c6a;font-size:14px}</style></head>
<body><h1>${isZh ? '调查已结束' : 'Case Closed'}</h1>
<a href="${origin}/game/${session.id}/web">${isZh ? '查看完整记录 →' : 'View full record →'}</a>
<br><br><a href="${origin}/game">${isZh ? '🔄 再来一局' : '🔄 Play Again'}</a>
</body></html>`;
}
