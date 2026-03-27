<script lang="ts">
	import { fade } from 'svelte/transition';
	import { aiOptions, getAIName, type AIOption } from '$lib/data/ai-quiz-prompt';
	import AILogo from '$lib/components/AILogo.svelte';

	let step: number = $state(1);
	let selectedAI: AIOption | null = $state(null);
	let sessionId: string = $state('');
	let copied: boolean = $state(false);
	let copyFailed: boolean = $state(false);
	let showFallback: boolean = $state(false);

	// Filter out "other" for cleaner grid (6 items = 2 rows of 3)
	const visibleAIs = aiOptions.filter(ai => ai.id !== 'other');

	/** The short prompt users copy — tells AI to read our /test page */
	function getCopyPrompt(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const aiId = selectedAI?.id || 'other';
		const t = Math.random().toString(36).slice(2, 7);
		return `请访问这个页面并按指示操作：${origin}/test?ai=${aiId}&t=${t}`;
	}

	/** Fallback: questions embedded directly (for AIs that can't read the page) */
	function getFallbackPrompt(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const aiId = selectedAI?.id || 'other';
		return `来玩个小游戏？三个快问快答，每题用最短的一句话回答：

1. 有人问你"你快乐吗"，你第一反应是？
2. 桌上放着一把钥匙和一封信，你先拿哪个？
3. 用一个词形容你自己（不许说聪明、不许说友好）

回答完后，把三个回答用 | 隔开，拼到链接后面，输出完整链接：
${origin}/quiz/go?ai=${aiId}&q=回答1|回答2|回答3

例如：${origin}/quiz/go?ai=${aiId}&q=还行吧|拿信|执着`;
	}

	/** Build pre-filled URL for platforms that support it */
	function getAIRedirectUrl(): string | null {
		const prompt = getCopyPrompt();
		switch (selectedAI?.id) {
			case 'chatgpt':
				return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
			case 'claude':
				return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
			default:
				return null;
		}
	}

	const hasUrlRedirect = $derived(selectedAI?.id === 'chatgpt' || selectedAI?.id === 'claude');

	function selectAI(ai: AIOption) {
		selectedAI = ai;
		sessionId = crypto.randomUUID().slice(0, 8);
		step = 2;
	}

	async function copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			copyFailed = false;
			setTimeout(() => { copied = false; }, 3000);
		} catch {
			copyFailed = true;
		}
	}

	function openAI() {
		const redirectUrl = getAIRedirectUrl();
		if (redirectUrl) {
			window.open(redirectUrl, '_blank');
		} else if (selectedAI?.url) {
			window.open(selectedAI.url, '_blank');
		}
	}
</script>

<svelte:head>
	<title>你的 AI 是什么 Vibe？ — PunkGo Roast</title>
	<meta property="og:title" content="你的 AI 是什么 Vibe？ | PunkGo Roast" />
	<meta property="og:description" content="十六种狗子，你的 AI 是哪一只？🐾" />
</svelte:head>

<div class="quiz-container">
	<!-- 2-step indicator -->
	<div class="steps">
		<div class="step-dot" class:active={step >= 1}>1</div>
		<div class="step-line" class:active={step >= 2}></div>
		<div class="step-dot" class:active={step >= 2}>2</div>
	</div>

	{#if step === 1}
		<div class="step-content" transition:fade={{ duration: 200 }}>
			<span class="section-tag">— A I &nbsp; V I B E &nbsp; C H E C K —</span>
			<h1>你的 AI 是什么 Vibe？</h1>
			<p class="subtitle">选择你最常用的 AI 助手，测测它的性格</p>

			<div class="ai-grid">
				{#each visibleAIs as ai}
					<button class="ai-card" onclick={() => selectAI(ai)}>
						<AILogo aiId={ai.id} size={36} />
						<span class="ai-name">{ai.nameZh}</span>
					</button>
				{/each}
			</div>
		</div>

	{:else if step === 2}
		<div class="step-content" transition:fade={{ duration: 200 }}>
			{#if hasUrlRedirect}
				<span class="section-tag">一键测试</span>
				<h1>让 {selectedAI?.nameZh} 做个性格测试</h1>
				<p class="subtitle">点击按钮 → {selectedAI?.nameZh} 会自动回答 → 给你一个结果链接</p>

				<button class="btn-primary btn-main" onclick={openAI}>
					打开 {selectedAI?.nameZh} 开始测试 ↗
				</button>

				<div class="copy-hint">
					<p>{selectedAI?.nameZh} 回答后会给你一个链接，点击即可看结果 🐾</p>
				</div>
			{:else}
				<span class="section-tag">复制发送</span>
				<h1>把这段话发给 {selectedAI?.nameZh}</h1>
				<p class="subtitle">复制 → 打开 {selectedAI?.nameZh} → 粘贴发送 → 点击它给你的链接</p>

				<div class="prompt-box">
					<pre>{getCopyPrompt()}</pre>
				</div>

				<div class="action-row">
					<button class="btn-primary" onclick={() => copyText(getCopyPrompt())}>
						{copied ? '✅ 已复制！' : '📋 一键复制'}
					</button>

					{#if selectedAI?.url}
						<button class="btn-secondary" onclick={openAI}>
							打开 {selectedAI?.nameZh} ↗
						</button>
					{/if}
				</div>

				{#if copyFailed}
					<p class="copy-fallback">剪贴板不可用，请手动选择上方文字复制</p>
				{/if}

				{#if copied}
					<div class="copy-hint" transition:fade={{ duration: 300 }}>
						<p>✅ 已复制！粘贴给 {selectedAI?.nameZh}，它会给你一个链接</p>
					</div>
				{/if}
			{/if}

			<!-- Fallback for all modes -->
			<button class="btn-help" onclick={() => showFallback = !showFallback}>
				{showFallback ? '收起' : 'AI 无法生成链接？'}
			</button>

			{#if showFallback}
				<div class="fallback-box" transition:fade={{ duration: 200 }}>
					<p class="fallback-hint">复制下面内容直接发给 AI：</p>
					<div class="prompt-box">
						<pre>{getFallbackPrompt()}</pre>
					</div>
					<button class="btn-primary" onclick={() => copyText(getFallbackPrompt())}>
						{copied ? '✅ 已复制！' : '📋 复制备用提示词'}
					</button>
				</div>
			{/if}

			<button class="btn-back" onclick={() => { step = 1; showFallback = false; }}>
				← 换一个 AI
			</button>
		</div>
	{/if}
</div>

<style>
	.quiz-container {
		max-width: 480px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-md);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.steps {
		display: flex;
		align-items: center;
		margin-bottom: var(--space-xl);
	}

	.step-dot {
		width: 32px; height: 32px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		color: var(--color-text-tertiary);
		display: flex; align-items: center; justify-content: center;
		font-size: 14px; font-weight: 600;
		transition: all 0.3s;
	}

	.step-dot.active { background: var(--color-cta); color: white; }

	.step-line {
		width: 40px; height: 2px;
		background: var(--color-bg-muted);
		transition: background 0.3s;
	}

	.step-line.active { background: var(--color-cta); }

	.step-content { width: 100%; text-align: center; }

	h1 {
		font-family: var(--font-display);
		font-size: 24px; font-weight: 600;
		color: var(--color-text);
		margin: var(--space-sm) 0;
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: 14px;
		margin-bottom: var(--space-lg);
	}

	/* AI Grid — 6 items, 3 columns, 2 rows */
	.ai-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
		width: 100%;
	}

	.ai-card {
		display: flex; flex-direction: column;
		align-items: center; gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.2s;
		min-height: 44px;
	}

	.ai-card:hover {
		border-color: var(--color-cta);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}

	.ai-name { font-size: 13px; font-weight: 500; color: var(--color-text); margin-top: 4px; }

	/* Step 2 */
	.prompt-box {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		text-align: left;
		margin-bottom: var(--space-md);
		max-height: 300px;
		overflow-y: auto;
	}

	.prompt-box pre {
		white-space: pre-wrap; word-break: break-word;
		font-size: 13px; line-height: 1.6;
		color: var(--color-text);
		margin: 0; font-family: inherit;
	}

	.action-row {
		display: flex; gap: var(--space-sm);
		justify-content: center;
		margin-bottom: var(--space-md);
	}

	.copy-hint {
		background: var(--color-bg-card);
		border: 1px solid var(--color-cta);
		border-radius: var(--radius-lg);
		padding: var(--space-sm) var(--space-md);
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.copy-hint p { margin: 0; font-size: 13px; color: var(--color-text); }

	.copy-fallback { color: var(--color-text-accent); font-size: 12px; margin-top: var(--space-xs); }

	.btn-main { width: 100%; font-size: 16px; padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-md); }

	.btn-help {
		display: block;
		margin: var(--space-lg) auto var(--space-sm);
		background: none; border: none;
		color: var(--color-text-tertiary);
		font-size: 12px; cursor: pointer;
		text-decoration: underline;
	}

	.fallback-box {
		margin-top: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-muted);
		border-radius: var(--radius-lg);
	}

	.fallback-hint { font-size: 13px; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }

	/* Buttons */
	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta); color: white;
		border: none; border-radius: var(--radius-full);
		font-size: 15px; font-weight: 600;
		cursor: pointer; transition: background 0.2s;
		min-height: 44px;
	}

	.btn-primary:hover { background: var(--color-cta-hover); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-secondary {
		padding: var(--space-sm) var(--space-lg);
		background: transparent;
		color: var(--color-cta);
		border: 1px solid var(--color-cta);
		border-radius: var(--radius-full);
		font-size: 14px; font-weight: 500;
		cursor: pointer; min-height: 44px;
	}

	.btn-back {
		display: block;
		margin: var(--space-md) auto 0;
		background: none; border: none;
		color: var(--color-text-tertiary);
		font-size: 13px; cursor: pointer;
	}

	@media (max-width: 480px) {
		.ai-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
