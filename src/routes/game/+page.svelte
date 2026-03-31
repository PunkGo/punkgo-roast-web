<script lang="ts">
	import { onMount } from 'svelte';
	import { copyToClipboard } from '$lib/utils/copy';

	let isZh = $state(true);
	let copied = $state(false);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	function getStartUrl(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const t = Date.now();
		const params = isZh ? `?t=${t}&lang=zh` : `?t=${t}`;
		const prefix = isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: ';
		return `${prefix}${origin}/game/start${params}`;
	}

	async function copyUrl() {
		try {
			await copyToClipboard(getStartUrl());
			copied = true;
			setTimeout(() => { copied = false; }, 3000);
		} catch { }
	}
</script>

<svelte:head>
	<title>{isZh ? '消失的房间 — AI 解密游戏' : 'The Missing Room — AI Mystery Game'}</title>
</svelte:head>

<div class="game-landing">
	<img class="hero" src="/game/game_hero.jpg" alt="The Missing Room" />
	<span class="badge">— T H E &nbsp; M I S S I N G &nbsp; R O O M —</span>
	<h1>{isZh ? '消失的房间' : 'The Missing Room'}</h1>
	<p class="sub">{isZh
		? '百年老宅里有一间消失的房间。你和 AI 搭档一起找到它。'
		: 'A hidden room in a century-old mansion. Find it with your AI partner.'}</p>

	<div class="stats">
		<span>10 {isZh ? '轮' : 'rounds'}</span>
		<span>·</span>
		<span>3 {isZh ? '结局' : 'endings'}</span>
		<span>·</span>
		<span>~15 min</span>
		<span>·</span>
		<span>{isZh ? '任何 AI' : 'any AI'}</span>
	</div>

	<div class="how">
		<h2>{isZh ? '怎么玩' : 'How to play'}</h2>
		<div class="step">
			<span class="step-num">1</span>
			<span>{isZh ? '复制下面的文字发给 AI' : 'Copy text below, send to your AI'}</span>
		</div>
		<div class="step">
			<span class="step-num">2</span>
			<span>{isZh ? 'AI 起侦探名字，给你一个链接' : 'AI names itself, gives you a link'}</span>
		</div>
		<div class="step">
			<span class="step-num">3</span>
			<span>{isZh ? '点链接，填昵称，开始破案' : 'Click link, enter name, investigate'}</span>
		</div>
	</div>

	<div class="prompt-box">
		<pre class="prompt-text">{getStartUrl()}</pre>
		<button class="btn-copy" onclick={copyUrl}>
			{copied ? (isZh ? '✅ 已复制！' : '✅ Copied!') : (isZh ? '📋 复制发给 AI' : '📋 Copy & send to AI')}
		</button>
	</div>
</div>

<style>
	.game-landing {
		max-width: 480px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md) var(--space-3xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.hero { width: 100%; border-radius: var(--radius-lg); margin-bottom: var(--space-lg); }
	.badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: var(--color-text-tertiary); }
	h1 { font-size: var(--font-size-xl); font-weight: 700; margin: var(--space-sm) 0; }
	.sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-md); line-height: 1.6; }
	.stats { display: flex; gap: var(--space-sm); font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-lg); }

	.how { width: 100%; text-align: left; margin-bottom: var(--space-lg); }
	.how h2 { font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-sm); }
	.step { display: flex; gap: var(--space-sm); align-items: flex-start; margin-bottom: var(--space-sm); font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; }
	.step-num {
		flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
		background: #3A2518; color: #F5F0E8;
		display: flex; align-items: center; justify-content: center;
		font-size: 12px; font-weight: 700;
	}

	.prompt-box {
		width: 100%; padding: var(--space-md);
		background: var(--color-bg-card); border: 1.5px solid #3A2518;
		border-radius: var(--radius-lg);
		display: flex; flex-direction: column; gap: var(--space-sm);
	}
	.prompt-text {
		font-size: var(--font-size-sm); line-height: 1.6;
		white-space: pre-wrap; word-break: break-all;
		margin: 0; font-family: inherit;
	}
	.btn-copy {
		padding: var(--space-sm) var(--space-lg);
		background: #3A2518; color: #F5F0E8;
		border: none; border-radius: var(--radius-full);
		font-size: var(--font-size-md); font-weight: 600;
		cursor: pointer; min-height: 48px;
	}
	.btn-copy:hover { background: #2a1a10; }
</style>
