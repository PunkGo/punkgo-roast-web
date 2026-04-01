<script lang="ts">
	import { fade } from 'svelte/transition';
	import { aiOptions, getAIName, type AIOption } from '$lib/data/ai-quiz-prompt';
	import AILogo from '$lib/components/AILogo.svelte';
	import { copyToClipboard } from '$lib/utils/copy';

	let { data } = $props();

	import { onMount } from 'svelte';

	let step: number = $state(1);
	let selectedAI: AIOption | null = $state(null);
	let copied: boolean = $state(false);
	let copyFailed: boolean = $state(false);
	let isZh: boolean = $state(true);
	let isMobile: boolean = $state(false);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	});

	const visibleAIs = aiOptions;
	const aiDisplayName = $derived(isZh ? (selectedAI?.nameZh || 'AI') : (selectedAI?.name || 'AI'));

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
			await copyToClipboard(text);
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
	<title>{isZh ? '你的 AI 是什么 Vibe？' : "What's Your AI's Vibe?"} — PunkGo Roast</title>
	<meta property="og:title" content="{isZh ? '你的 AI 是什么 Vibe？' : "What's Your AI's Vibe?"} | PunkGo Roast" />
	<meta property="og:description" content="{isZh ? '十六种狗子，你的 AI 是哪一只？🐾' : '16 breeds. Which one is your AI? 🐾'}" />
</svelte:head>

<div class="quiz-container">
	<div class="steps">
		<div class="step-dot" class:active={step >= 1}>1</div>
		<div class="step-line" class:active={step >= 2}></div>
		<div class="step-dot" class:active={step >= 2}>2</div>
	</div>

	{#if step === 1}
		<div class="step-content">
			<span class="section-tag">— A I &nbsp; V I B E &nbsp; C H E C K —</span>
			<h1>{isZh ? '你的 AI 是什么 Vibe？' : "What's Your AI's Vibe?"}</h1>
			<p class="subtitle">{isZh ? '选择你最常用的 AI 助手，测测它的性格' : 'Pick your AI assistant and discover its personality'}</p>

			<div class="ai-grid">
				{#each visibleAIs as ai}
					<button class="ai-card" onclick={() => selectAI(ai)}>
						<AILogo aiId={ai.id} size={36} />
						<span class="ai-name">{isZh ? ai.nameZh : ai.name}</span>
					</button>
				{/each}
			</div>
		</div>

	{:else if step === 2}
		<div class="step-content">
			{#if hasUrlRedirect}
				<span class="section-tag">{isZh ? '一键测试' : 'One-Click Test'}</span>
				<h1>{isZh ? `让 ${aiDisplayName} 做个性格测试` : `Let ${aiDisplayName} take a personality test`}</h1>
				<p class="subtitle">{isZh ? `点击下方按钮，${aiDisplayName} 会自动回答并给你一个结果链接` : `Click below — ${aiDisplayName} will answer automatically and give you a result link`}</p>

				<button class="btn-primary btn-main" onclick={openAI}>
					{isZh ? `打开 ${aiDisplayName} 开始测试 ↗` : `Open ${aiDisplayName} to start ↗`}
				</button>

				<div class="copy-hint">
					<p>{isZh ? `${aiDisplayName} 回答后会给你一个链接，点击即可看结果 🐾` : `${aiDisplayName} will give you a link after answering — click it to see your result 🐾`}</p>
				</div>
			{:else}
				<span class="section-tag">{isZh ? '测测 TA 的性格' : 'Test its personality'}</span>
				<h1>{isZh ? `让你的 ${aiDisplayName} 做一个性格测试` : `Give your ${aiDisplayName} a personality test`}</h1>
				<p class="subtitle">{isZh
					? `复制下面的话 → 发给 ${aiDisplayName} → 点击它给你的链接看结果`
					: `Copy the text below → send it to ${aiDisplayName} → click the link it gives you`}</p>

				<div class="prompt-box">
					<pre>{getCopyPrompt()}</pre>
				</div>

				<div class="action-row">
					<button class="btn-primary" onclick={copyText}>
						{copied
							? (isZh ? '✅ 已复制！' : '✅ Copied!')
							: (isZh ? '📋 一键复制' : '📋 Copy prompt')}
					</button>

					{#if selectedAI?.url}
						{#if isMobile}
							<p class="mobile-hint">{isZh ? `复制后打开 ${aiDisplayName} App 粘贴` : `After copying, open the ${aiDisplayName} app and paste`}</p>
						{:else}
							<button class="btn-secondary" onclick={openAI}>
								{isZh ? `打开 ${aiDisplayName} ↗` : `Open ${aiDisplayName} ↗`}
							</button>
						{/if}
					{/if}
				</div>

				{#if copyFailed}
					<p class="copy-fallback">{isZh ? '剪贴板不可用，请手动选择上方文字复制' : 'Clipboard unavailable — please select and copy the text above manually'}</p>
				{/if}

				{#if copied}
					<div class="copy-hint" transition:fade={{ duration: 300 }}>
						<p>{isZh
							? `✅ 已复制！粘贴给 ${aiDisplayName}，等它给你一个神秘链接 🐾`
							: `✅ Copied! Paste it to ${aiDisplayName} and wait for a mystery link 🐾`}</p>
					</div>
				{/if}
			{/if}

			<div class="thinking-tip">
				<span class="tip-icon">💡</span>
				<span>{isZh ? '建议开启 AI 的「深度思考」模式（Thinking/推理模式），性格信号更强，测试结果更准' : 'Tip: Enable "Thinking" or reasoning mode in your AI for stronger personality signals and more accurate results'}</span>
			</div>

			{#if selectedAI?.id === 'claude'}
				<div class="thinking-tip">
					<span class="tip-icon">✨</span>
					<span>{isZh ? '推荐使用 Sonnet 模型，配合度最高、人格表现最丰富。Opus 可能因为过于谨慎而跳过部分题目' : 'We recommend Sonnet for the best experience — it\'s the most expressive and cooperative. Opus may skip some questions due to its cautious nature'}</span>
				</div>
			{/if}

			<button class="btn-back" onclick={() => { step = 1; }}>
				{isZh ? '← 换一个 AI' : '← Pick a different AI'}
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
		transition: background 0.3s, color 0.3s;
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
		font-size: var(--font-size-xl); font-weight: 600;
		color: var(--color-text);
		margin: var(--space-sm) 0;
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
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
		transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
		min-height: 44px;
	}

	.ai-card:hover {
		border-color: var(--color-cta);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}

	.ai-name { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); margin-top: 4px; }

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
		font-size: var(--font-size-sm); line-height: 1.6;
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

	.copy-hint p { margin: 0; font-size: var(--font-size-sm); color: var(--color-text); }

	.copy-fallback { color: var(--color-text-accent); font-size: 12px; margin-top: var(--space-xs); }

	.btn-main { width: 100%; font-size: var(--font-size-base); padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-md); }

	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta); color: white;
		border: none; border-radius: var(--radius-full);
		font-size: var(--font-size-md); font-weight: 600;
		cursor: pointer; transition: background 0.2s;
		min-height: 44px;
	}

	.btn-primary:hover { background: var(--color-cta-hover); }

	.mobile-hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		margin: var(--space-sm) 0 0;
		text-align: center;
	}

	.btn-secondary {
		padding: var(--space-sm) var(--space-lg);
		background: transparent;
		color: var(--color-cta);
		border: 1px solid var(--color-cta);
		border-radius: var(--radius-full);
		font-size: 14px; font-weight: 500;
		cursor: pointer; min-height: 44px;
	}

	.thinking-tip {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: 10px 14px;
		border-radius: var(--radius-md);
		background: var(--color-bg-muted);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-top: var(--space-md);
	}
	.tip-icon { flex-shrink: 0; font-size: var(--font-size-base); }

	.btn-back {
		display: block;
		margin: var(--space-lg) auto 0;
		background: none; border: none;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-sm); cursor: pointer;
	}

	@media (max-width: 480px) {
		.ai-grid { grid-template-columns: repeat(2, 1fr); }
		.action-row { flex-wrap: wrap; justify-content: center; }
	}
</style>
