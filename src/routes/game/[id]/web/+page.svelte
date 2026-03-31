<script lang="ts">
	import { onMount } from 'svelte';
	import { copyToClipboard } from '$lib/utils/copy';
	import { ROUNDS, getEnding } from '$lib/data/game-story';

	let { data } = $props();
	let isZh = $state(true);
	let copied = $state(false);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const session = data.session;
	const isComplete = session?.status === 'completed';

	function getPromptUrl(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const prefix = isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: ';
		return `${prefix}${origin}/game/${session?.id}`;
	}

	async function copyPrompt() {
		try {
			await copyToClipboard(getPromptUrl());
			copied = true;
			setTimeout(() => { copied = false; }, 3000);
		} catch { }
	}
</script>

<svelte:head>
	<title>{isZh ? '消失的房间' : 'The Missing Room'} — {session?.ai_name} & {session?.player_name}</title>
</svelte:head>

{#if data.error}
	<div class="game-web">
		<h1>{isZh ? '游戏不存在' : 'Game not found'}</h1>
		<a href="/game">{isZh ? '← 开始新游戏' : '← Start new game'}</a>
	</div>
{:else}
	<div class="game-web">
		<span class="badge">— T H E &nbsp; M I S S I N G &nbsp; R O O M —</span>
		<h1>{session.ai_name} & {session.player_name}</h1>
		<p class="meta">Round {session.current_round}/10 · {isComplete ? (isZh ? '已完成' : 'Complete') : (isZh ? '进行中' : 'In progress')}</p>

		<div class="progress">
			{#each Array(10) as _, i}
				<div class="dot" class:done={isComplete || i < session.choices.length} class:current={!isComplete && i === session.choices.length}>
					{i + 1}
				</div>
			{/each}
		</div>

		{#if session.choices.length > 0}
			<div class="log">
				{#each session.choices as choice, i}
					{@const round = ROUNDS[i]}
					{@const summary = isZh ? round.summaryZh(choice) : round.summaryEn(choice)}
					<div class="log-entry" class:latest={i === session.choices.length - 1}>
						<div class="log-header">
							<span class="log-round">Round {i + 1}</span>
							<span class="log-choice">{choice}</span>
						</div>
						<p>{summary}</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if isComplete}
			{@const round9Choice = session.choices[8] || 'C'}
			{@const ending = getEnding(round9Choice, session.ai_name, session.player_name, isZh)}
			{@const cardImg = round9Choice === 'A' ? 'card_a' : round9Choice === 'B' ? 'card_b' : 'card_c'}
			{@const stars = round9Choice === 'A' ? '★★★' : round9Choice === 'B' ? '★★☆' : '★☆☆'}
			{@const endingLabel = round9Choice === 'A' ? (isZh ? '完美结局' : 'PERFECT ENDING') : round9Choice === 'B' ? (isZh ? '不错的结局' : 'GOOD ENDING') : (isZh ? '苦涩的结局' : 'BITTERSWEET ENDING')}

			<div class="rating-card">
				<img src="/game/{cardImg}.jpg" alt="" class="card-bg" />
				<div class="card-overlay">
					<div class="card-stars">{stars}</div>
					<div class="card-label">{endingLabel}</div>
					<div class="card-names">{session.ai_name} & {session.player_name}</div>
					<div class="card-rounds">roast.punkgo.ai/game</div>
				</div>
			</div>

			<div class="ending">
				<h2>{isZh ? '结局' : 'Ending'}</h2>
				{#each ending.split('\n\n') as para}
					{#if para.includes('═══')}
						<div class="ending-badge">{para.replace(/═/g, '').trim()}</div>
					{:else if para.includes('🏆') || para.includes('Well done') || para.includes('干得好') || para.includes('恭喜')}
						<div class="ending-result">{para.trim()}</div>
					{:else}
						<p class="ending-para">{para.trim()}</p>
					{/if}
				{/each}
			</div>

			<div class="end-actions">
				<a class="btn-action" href="/game">{isZh ? '🔄 再来一局' : '🔄 Play Again'}</a>
			</div>
		{:else}
			<div class="prompt-box">
				<p class="prompt-label">{isZh ? `复制发给 ${session.ai_name} 继续：` : `Copy and send to ${session.ai_name}:`}</p>
				<pre class="prompt-text">{getPromptUrl()}</pre>
				<button class="btn-copy" onclick={copyPrompt}>
					{copied ? (isZh ? '✅ 已复制' : '✅ Copied') : (isZh ? '📋 复制' : '📋 Copy')}
				</button>
			</div>
		{/if}

		<a class="back" href="/game">{isZh ? '← 新游戏' : '← New game'}</a>
	</div>
{/if}

<style>
	.game-web {
		max-width: 520px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md) var(--space-3xl);
	}
	.badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: var(--color-text-tertiary); }
	h1 { font-size: var(--font-size-xl); font-weight: 700; margin: var(--space-sm) 0; }
	.meta { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-lg); }

	.progress { display: flex; gap: 6px; margin-bottom: var(--space-lg); flex-wrap: wrap; }
	.dot {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--color-bg-muted); border: 1px solid var(--color-border);
		display: flex; align-items: center; justify-content: center;
		font-size: 11px; color: var(--color-text-tertiary);
	}
	.dot.done { background: #5a8c6a; color: #fff; border-color: #5a8c6a; }
	.dot.current { background: #c8a060; color: #1a1510; border-color: #c8a060; font-weight: 700; }

	.log { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-lg); }
	.log-entry {
		padding: 12px 14px; border-radius: var(--radius-md);
		background: var(--color-bg-card); border: 1px solid var(--color-border);
	}
	.log-entry.latest { border-color: #c8a060; }
	.log-header { display: flex; gap: var(--space-sm); align-items: center; }
	.log-round { font-size: 11px; font-weight: 700; color: #5a8c6a; }
	.log-choice { font-size: 11px; font-weight: 700; color: #c8a060; }
	.log-entry p { margin: 4px 0 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; }

	.rating-card { position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-lg); }
	.card-bg { width: 100%; display: block; }
	.card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(26,21,16,0.95)); text-align: center; }
	.card-stars { font-size: 28px; color: #c8a060; letter-spacing: 4px; margin-bottom: 4px; }
	.card-label { font-size: 14px; font-weight: 700; color: #c8a060; letter-spacing: 0.15em; margin-bottom: 8px; }
	.card-names { font-size: 16px; font-weight: 700; color: var(--color-text); margin-bottom: 4px; }
	.card-rounds { font-size: 11px; color: var(--color-text-tertiary); letter-spacing: 0.05em; }
	.end-actions { margin-bottom: var(--space-lg); }
	.btn-action { display: block; padding: 14px; border-radius: var(--radius-full); text-align: center; font-size: 14px; font-weight: 700; text-decoration: none; background: #3A2518; color: #F5F0E8; }
	.ending { margin-bottom: var(--space-lg); }
	.ending h2 { font-size: var(--font-size-base); font-weight: 700; color: #c8a060; margin-bottom: var(--space-md); }
	.ending-para {
		font-size: var(--font-size-sm); line-height: 1.8; color: var(--color-text-primary);
		margin: 0 0 var(--space-md);
		padding: 12px 16px; border-radius: var(--radius-md);
		background: var(--color-bg-card); border: 1px solid var(--color-border);
	}
	.ending-badge {
		font-size: 13px; font-weight: 700; color: #c8a060;
		text-align: center; padding: var(--space-sm) 0;
		letter-spacing: 0.05em; margin: var(--space-md) 0;
	}
	.ending-result {
		font-size: var(--font-size-sm); font-weight: 600; color: #5a8c6a;
		text-align: center; padding: var(--space-md);
		background: var(--color-bg-muted); border-radius: var(--radius-lg);
		margin: var(--space-sm) 0;
	}

	.prompt-box {
		padding: var(--space-md); border-radius: var(--radius-lg);
		background: var(--color-bg-card); border: 1.5px solid #3A2518;
		text-align: center;
	}
	.prompt-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
	.prompt-text {
		font-size: var(--font-size-sm); line-height: 1.5;
		background: var(--color-bg-muted); padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md); white-space: pre-wrap; word-break: break-all;
		margin: 0 0 var(--space-sm); font-family: inherit;
	}
	.btn-copy {
		padding: var(--space-sm) var(--space-lg);
		background: #3A2518; color: #F5F0E8;
		border: none; border-radius: var(--radius-full);
		font-size: var(--font-size-sm); font-weight: 600; cursor: pointer; min-height: 44px;
	}
	.btn-copy:hover { background: #2a1a10; }

	.back { display: inline-block; margin-top: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-cta); }
</style>
