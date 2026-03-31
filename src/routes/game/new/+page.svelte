<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { copyToClipboard } from '$lib/utils/copy';

	let isZh = $state(true);
	let phase: 'input' | 'ready' = $state('input');

	let aiName = $state('');
	let playerName = $state('');
	let creating = $state(false);
	let error = $state('');

	let sessionId = $state('');
	let promptUrl = $state('');
	let copied = $state(false);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		// Pre-fill AI name from URL param
		const urlAiName = $page.url.searchParams.get('ai');
		if (urlAiName) {
			// Multi-layer decode
			let name = urlAiName;
			for (let i = 0; i < 3; i++) {
				if (name.includes('%')) {
					try { const d = decodeURIComponent(name); if (d === name) break; name = d; } catch { break; }
				} else break;
			}
			aiName = name.trim();
		}
	});

	async function start() {
		if (!aiName.trim() || !playerName.trim()) return;
		creating = true;
		error = '';

		try {
			const res = await fetch('/game/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					aiName: aiName.trim(),
					playerName: playerName.trim(),
					locale: isZh ? 'zh' : 'en',
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Failed to create game';
				return;
			}
			sessionId = data.id;
			const origin = window.location.origin;
			promptUrl = `${isZh ? '请访问这个链接并按指示操作：' : 'Visit this link and follow the instructions: '}${origin}/game/${sessionId}?t=${Date.now()}`;
			phase = 'ready';
		} catch {
			error = isZh ? '网络错误，请重试' : 'Network error';
		} finally {
			creating = false;
		}
	}

	async function copyPrompt() {
		try {
			await copyToClipboard(promptUrl);
			copied = true;
			setTimeout(() => { copied = false; }, 3000);
		} catch { }
	}
</script>

<svelte:head>
	<title>{isZh ? '消失的房间 — 加入调查' : 'The Missing Room — Join Investigation'}</title>
</svelte:head>

<div class="game-entry">
	{#if phase === 'input'}
		<span class="badge">— T H E &nbsp; M I S S I N G &nbsp; R O O M —</span>
		<h1>{isZh ? '加入调查' : 'Join the Investigation'}</h1>

		{#if aiName}
			<p class="sub">{isZh
				? `你的 AI 搭档 ${aiName} 已就位，正在等你。输入你的昵称开始破案。`
				: `Your AI partner ${aiName} is ready and waiting. Enter your nickname to begin.`}</p>
		{:else}
			<p class="sub">{isZh
				? '一栋百年老宅，一间蓝图上存在但找不到的房间。你和你的 AI 搭档能找到隐藏的入口吗？'
				: 'A century-old mansion. A room on the blueprints that can\'t be found. Can you and your AI partner find it?'}</p>
		{/if}

		<div class="form">
			<label class="input-label">{isZh ? 'AI 搭档名称' : 'AI Partner Name'}</label>
			<input
				type="text"
				bind:value={aiName}
				placeholder={isZh ? '例：豆包警官' : 'e.g. Detective GPT'}
				maxlength="30"
				disabled={!!$page.url.searchParams.get('ai')}
			/>

			<label class="input-label">{isZh ? '你的昵称' : 'Your Nickname'}</label>
			<input
				type="text"
				bind:value={playerName}
				placeholder={isZh ? '例：肥舅' : 'e.g. Felix'}
				maxlength="30"
				onkeydown={(e) => e.key === 'Enter' && start()}
			/>

			<button class="btn-start" onclick={start} disabled={creating || !aiName.trim() || !playerName.trim()}>
				{creating ? '...' : (isZh ? '开始破案' : 'Start Investigation')}
			</button>

			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>

	{:else if phase === 'ready'}
		<span class="badge">— R E A D Y —</span>
		<h1>{isZh ? '调查开始' : 'Investigation Begins'}</h1>
		<p class="sub">{isZh
			? `${playerName}，把下面的文字发回给 ${aiName}，开始第一轮调查。`
			: `${playerName}, send the text below back to ${aiName} to begin Round 1.`}</p>

		<div class="prompt-box">
			<pre class="prompt-text">{promptUrl}</pre>
			<button class="btn-copy" onclick={copyPrompt}>
				{copied ? (isZh ? '✅ 已复制！' : '✅ Copied!') : (isZh ? '📋 复制发给 AI' : '📋 Copy & send to AI')}
			</button>
		</div>

		<div class="actions">
			<a class="btn-link" href="/game/{sessionId}/web">
				{isZh ? '查看游戏进度 →' : 'View progress →'}
			</a>
		</div>
	{/if}
</div>

<style>
	.game-entry {
		max-width: 480px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md) var(--space-3xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: var(--color-text-tertiary); }
	h1 { font-size: var(--font-size-xl); font-weight: 700; margin: var(--space-sm) 0; }
	.sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-lg); line-height: 1.6; }

	.form { width: 100%; display: flex; flex-direction: column; gap: var(--space-sm); text-align: left; }
	.input-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); }
	.form input {
		width: 100%; padding: 12px 14px;
		border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
		font-size: var(--font-size-md); background: var(--color-bg-card); font-family: inherit;
	}
	.form input:focus { outline: none; border-color: var(--color-cta); }
	.form input:disabled { opacity: 0.7; background: var(--color-bg-muted); }

	.btn-start {
		padding: var(--space-sm) var(--space-lg);
		background: #3A2518; color: #F5F0E8;
		border: none; border-radius: var(--radius-full);
		font-size: var(--font-size-md); font-weight: 600;
		cursor: pointer; min-height: 48px; margin-top: var(--space-sm);
	}
	.btn-start:hover { background: #2a1a10; }
	.btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

	.error { font-size: var(--font-size-sm); color: #C75050; margin: 0; }

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
		font-size: var(--font-size-sm); font-weight: 600;
		cursor: pointer; min-height: 44px;
	}
	.btn-copy:hover { background: #2a1a10; }

	.actions { margin-top: var(--space-md); }
	.btn-link { font-size: var(--font-size-sm); color: var(--color-cta); font-weight: 600; }
</style>
