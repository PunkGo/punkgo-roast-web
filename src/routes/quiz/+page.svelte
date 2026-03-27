<script lang="ts">
	import { fade } from 'svelte/transition';
	import { aiOptions, getAIName, type AIOption } from '$lib/data/ai-quiz-prompt';
	import AILogo from '$lib/components/AILogo.svelte';

	let { data } = $props();

	import { onMount } from 'svelte';

	let step: number = $state(1);
	let selectedAI: AIOption | null = $state(null);
	let copied: boolean = $state(false);
	let copyFailed: boolean = $state(false);
	let isZh: boolean = $state(true);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const visibleAIs = aiOptions.filter(ai => ai.id !== 'other');

	function ui(key: string): string {
		const aiName = selectedAI?.nameZh || 'AI';
		const langKey = isZh ? key : `${key}_en`;
		const raw = data.ui?.[langKey] || data.ui?.[key] || '';
		return raw.replaceAll('{{aiName}}', aiName);
	}

	function getCopyPrompt(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const aiId = selectedAI?.id || 'other';
		const aiName = selectedAI?.nameZh || 'AI';
		const t = Math.random().toString(36).slice(2, 7);
		const url = `${origin}/test?ai=${aiId}&t=${t}`;
		const teaser = (isZh ? data.copyPromptZh : data.copyPromptEn || data.copyPromptZh || '')
			.replaceAll('{{aiName}}', aiName);
		return `${teaser}\n\n${url}`;
	}

	function getAIRedirectUrl(): string | null {
		const prompt = `请访问这个链接并按指示操作：${getCopyPrompt()}`;
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
		step = 2;
	}

	async function copyText() {
		const text = getCopyPrompt();
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
				<span class="section-tag">{ui('step2_tag_redirect') || '一键测试'}</span>
				<h1>{ui('step2_title_redirect') || `让 ${selectedAI?.nameZh} 做个性格测试`}</h1>
				<p class="subtitle">{ui('step2_subtitle_redirect') || `点击下方按钮，${selectedAI?.nameZh} 会自动回答并给你一个结果链接`}</p>

				<button class="btn-primary btn-main" onclick={openAI}>
					{ui('step2_btn_redirect') || `打开 ${selectedAI?.nameZh} 开始测试 ↗`}
				</button>

				<div class="copy-hint">
					<p>{ui('step2_hint_redirect') || `${selectedAI?.nameZh} 回答后会给你一个链接，点击即可看结果 🐾`}</p>
				</div>
			{:else}
				<span class="section-tag">{ui('step2_tag_copy') || '测测 TA 的性格'}</span>
				<h1>{ui('step2_title_copy') || `让你的 ${selectedAI?.nameZh} 做一个性格测试`}</h1>
				<p class="subtitle">{ui('step2_subtitle_copy') || `复制下面的话 → 发给 ${selectedAI?.nameZh} → 点击它给你的链接看结果`}</p>

				<div class="prompt-box">
					<pre>{getCopyPrompt()}</pre>
				</div>

				<div class="action-row">
					<button class="btn-primary" onclick={copyText}>
						{copied ? (ui('step2_btn_copied') || '✅ 已复制！') : (ui('step2_btn_copy') || '📋 一键复制')}
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
						<p>{ui('step2_hint_copied') || `✅ 已复制！粘贴给 ${selectedAI?.nameZh}，等它给你一个神秘链接 🐾`}</p>
					</div>
				{/if}
			{/if}

			<button class="btn-back" onclick={() => { step = 1; }}>
				{ui('step2_btn_back') || '← 换一个 AI'}
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

	.prompt-box {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		text-align: left;
		margin-bottom: var(--space-md);
	}

	.prompt-box pre {
		white-space: pre-wrap; word-break: break-all;
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

	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta); color: white;
		border: none; border-radius: var(--radius-full);
		font-size: 15px; font-weight: 600;
		cursor: pointer; transition: background 0.2s;
		min-height: 44px;
	}

	.btn-primary:hover { background: var(--color-cta-hover); }

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
		margin: var(--space-lg) auto 0;
		background: none; border: none;
		color: var(--color-text-tertiary);
		font-size: 13px; cursor: pointer;
	}

	@media (max-width: 480px) {
		.ai-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
