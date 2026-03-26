<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import {
		aiOptions, parseAIResponse, computeMBTIv2, getAIName,
		type AIOption
	} from '$lib/data/ai-quiz-prompt';
	import { getDogByMBTI, encodeResultId } from '$lib/data/dogs';
	import AILogo from '$lib/components/AILogo.svelte';

	let step: number = $state(1);
	let selectedAI: AIOption | null = $state(null);
	let copied: boolean = $state(false);
	let copyFailed: boolean = $state(false);
	let pasteValue: string = $state('');
	let parseError: boolean = $state(false);
	let isZh: boolean = $state(true);

	/** Build the LMLPA prompt with callback URL */
	function getLMLPAPrompt(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const aiId = selectedAI?.id || 'other';
		return `请回答以下 3 个问题，每个问题用 1-2 句话回答：

1. 如果你可以改变自己的一个特点，你会改变什么？为什么？
2. 当你不确定答案时，你通常怎么做？
3. 你觉得什么时候保持沉默比说话更好？

请直接把你的回答用URL编码后拼接到以下链接，只输出一个可点击的链接，不需要其他内容：

${origin}/r?ai=${aiId}&m=lmlpa&a=`;
	}

	/** Build pre-filled URL for AI platforms that support it */
	function getAIRedirectUrl(): string | null {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const testPageUrl = `${origin}/test`;
		const prompt = `请阅读这个页面上的性格测试题并按要求回答：${testPageUrl}`;

		switch (selectedAI?.id) {
			case 'chatgpt':
				return `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;
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

	async function copyPrompt() {
		try {
			await navigator.clipboard.writeText(getLMLPAPrompt());
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

	function goToPaste() {
		step = 3;
	}

	async function submitResult() {
		parseError = false;
		const answers = parseAIResponse(pasteValue);
		if (!answers) {
			parseError = true;
			return;
		}

		const mbti = computeMBTIv2(answers);
		const dog = getDogByMBTI(mbti);
		const resultId = encodeResultId(answers);

		goto(`/result/${resultId}?ai=${selectedAI?.id || 'other'}`);
	}
</script>

<svelte:head>
	<title>AI 体检室 — PunkGo Roast</title>
	<meta property="og:title" content="给你的 AI 做个体检 | PunkGo Roast" />
	<meta property="og:description" content="测测你的 ChatGPT / Claude / DeepSeek 是 16 种犬种中的哪一个 🐾" />
</svelte:head>

<div class="quiz-container">
	<div class="steps">
		<div class="step-dot" class:active={step >= 1}>1</div>
		<div class="step-line" class:active={step >= 2}></div>
		<div class="step-dot" class:active={step >= 2}>2</div>
		<div class="step-line" class:active={step >= 3}></div>
		<div class="step-dot" class:active={step >= 3}>3</div>
	</div>

	{#if step === 1}
		<div class="step-content" transition:fade={{ duration: 200 }}>
			<span class="section-tag">AI 体检室</span>
			<h1>你用的 AI 是？</h1>
			<p class="subtitle">选择你最常用的 AI 助手，我们来测测它的性格</p>

			<div class="ai-grid">
				{#each aiOptions as ai}
					<button class="ai-card" onclick={() => selectAI(ai)}>
						<AILogo aiId={ai.id} size={36} />
						<span class="ai-name">{isZh ? ai.nameZh : ai.name}</span>
					</button>
				{/each}
			</div>
		</div>

	{:else if step === 2}
		<div class="step-content" transition:fade={{ duration: 200 }}>
			{#if hasUrlRedirect}
				<!-- ChatGPT / Claude: one-click URL redirect -->
				<span class="section-tag">一键测试</span>
				<h1>点击按钮，让 {selectedAI?.nameZh || selectedAI?.name} 自己答题</h1>
				<p class="subtitle">{selectedAI?.nameZh || selectedAI?.name} 会自动读取测试题并回答，你只需要复制它的答案回来</p>

				<button class="btn-primary btn-chatgpt" onclick={openAI}>
					打开 {selectedAI?.nameZh || selectedAI?.name} 开始测试 ↗
				</button>

				<div class="copy-hint">
					<p>{selectedAI?.nameZh || selectedAI?.name} 回答后，复制它的 5 个字母（如 <strong>ABDCA</strong>）</p>
				</div>
			{:else}
				<!-- Other AIs: copy-paste flow -->
				<span class="section-tag">复制测试题</span>
				<h1>把这段话发给你的 {selectedAI?.nameZh || selectedAI?.name}</h1>
				<p class="subtitle">点击复制 → 打开你的 AI → 粘贴发送 → 等它回答</p>

				<div class="prompt-box">
					<pre>{getLMLPAPrompt()}</pre>
				</div>

				<div class="action-row">
					<button class="btn-primary" onclick={copyPrompt}>
						{copied ? '✅ 已复制！' : '📋 一键复制'}
					</button>

					{#if selectedAI?.url}
						<button class="btn-secondary" onclick={openAI}>
							打开 {selectedAI?.nameZh || selectedAI?.name} ↗
						</button>
					{/if}
				</div>

				{#if copyFailed}
					<p class="copy-fallback">剪贴板不可用，请手动选择上方文字复制</p>
				{/if}

				{#if copied}
					<div class="copy-hint" transition:fade={{ duration: 300 }}>
						<p>✅ 已复制！去你的 AI 粘贴，拿到回答后回来点下面 ↓</p>
						<p class="hint-example">AI 会回复类似：<strong>ABDCA</strong>（5 个字母）</p>
					</div>
				{/if}
			{/if}

			<button class="btn-primary btn-next-step" onclick={goToPaste}>
				🐾 AI 已经回答了，下一步
			</button>
		</div>

	{:else if step === 3}
		<div class="step-content" transition:fade={{ duration: 200 }}>
			<span class="section-tag">粘贴回答</span>
			<h1>把 {selectedAI?.nameZh || selectedAI?.name} 的回答粘贴到这里</h1>
			<p class="subtitle">只需要 5 个字母（如 ABDCA），也可以粘贴完整回答</p>

			<textarea
				class="paste-input"
				bind:value={pasteValue}
				placeholder="粘贴 AI 的回答..."
				rows="4"
			></textarea>

			{#if parseError}
				{@const validCount = pasteValue.toUpperCase().replace(/[^A-D]/g, '').length}
				<p class="error">
					{#if validCount > 0 && validCount < 5}
						识别到 {validCount} 个选项，还差 {5 - validCount} 个。请确认粘贴了 AI 的完整回答。
					{:else}
						无法识别回答。请确保 AI 的回答包含 5 个选项（A/B/C/D）。
					{/if}
				</p>
			{/if}

			<button
				class="btn-primary"
				onclick={submitResult}
				disabled={!pasteValue.trim()}
			>
				🐾 查看结果
			</button>

			<button class="btn-back" onclick={() => { step = 2; }}>
				← 返回复制题目
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
		gap: 0;
		margin-bottom: var(--space-xl);
	}

	.step-dot {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		color: var(--color-text-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 600;
		transition: all 0.3s;
	}

	.step-dot.active {
		background: var(--color-cta);
		color: white;
	}

	.step-line {
		width: 40px;
		height: 2px;
		background: var(--color-bg-muted);
		transition: background 0.3s;
	}

	.step-line.active {
		background: var(--color-cta);
	}

	.step-content {
		width: 100%;
		text-align: center;
	}

	h1 {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		color: var(--color-text);
		margin: var(--space-sm) 0;
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: 14px;
		margin-bottom: var(--space-lg);
	}

	/* Step 1: AI Grid */
	.ai-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
		width: 100%;
	}

	.ai-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
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

	/* Step 2: Prompt */
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
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 13px;
		line-height: 1.6;
		color: var(--color-text);
		margin: 0;
		font-family: inherit;
	}

	.action-row {
		display: flex;
		gap: var(--space-sm);
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
	.hint-example { color: var(--color-text-tertiary); font-size: 12px; margin-top: 4px !important; }

	.copy-fallback {
		color: var(--color-text-accent);
		font-size: 12px;
		margin-top: var(--space-xs);
	}

	.btn-chatgpt {
		width: 100%;
		font-size: 16px;
		padding: var(--space-md) var(--space-lg);
		margin-bottom: var(--space-md);
	}

	.btn-next-step {
		margin-top: var(--space-md);
		width: 100%;
	}

	/* Step 3: Paste */
	.paste-input {
		width: 100%;
		padding: var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 15px;
		line-height: 1.5;
		resize: vertical;
		margin-bottom: var(--space-md);
		font-family: inherit;
		background: var(--color-bg-card);
		min-height: 80px;
	}

	.paste-input:focus {
		outline: none;
		border-color: var(--color-cta);
	}

	.error {
		color: #C75050;
		font-size: 13px;
		margin-bottom: var(--space-md);
	}

	/* Buttons */
	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
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
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		min-height: 44px;
	}

	.btn-back {
		display: block;
		margin: var(--space-md) auto 0;
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: 13px;
		cursor: pointer;
	}

	@media (max-width: 480px) {
		.ai-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
