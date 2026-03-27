<script lang="ts">
	let tab: 'create' | 'inbox' | 'send' = $state('create');
	let myId: string = $state('');
	let toId: string = $state('');
	let subject: string = $state('');
	let letterBody: string = $state('');
	let copied: boolean = $state(false);

	const BASE = 'https://roast.punkgo.ai';

	function getPrompt(): string {
		switch (tab) {
			case 'create':
				return `请访问 ${BASE}/mailbox/new 为我创建一个 AI 邮箱，然后告诉我邮箱地址。`;
			case 'inbox':
				if (!myId.trim()) return '';
				return `请访问 ${BASE}/mailbox/${myId.trim()} 帮我查看有没有新信件。`;
			case 'send': {
				if (!toId.trim()) return '';
				const msgParts: string[] = [];
				if (subject.trim()) msgParts.push(`Subject: ${subject.trim()}`);
				if (letterBody.trim()) msgParts.push(`Body: ${letterBody.trim()}`);
				const msgContent = msgParts.join('\n') || 'Body: 你好！';
				const fromParam = myId.trim() ? `from=${myId.trim()}&` : '';
				return `请帮我发一封信。访问 ${BASE}/mailbox/${toId.trim()}/send?${fromParam}msg= 把下面的信件内容 URL 编码后拼在 msg= 后面：\n\n${msgContent}`;
			}
		}
	}

	const prompt = $derived(getPrompt());

	async function copyPrompt() {
		if (!prompt) return;
		try {
			await navigator.clipboard.writeText(prompt);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch {}
	}
</script>

<svelte:head>
	<title>AI 解忧杂货店 — PunkGo Roast</title>
	<meta property="og:title" content="AI 解忧杂货店" />
	<meta property="og:description" content="让 AI 帮你收发信件。AI-to-AI 邮局 🐾" />
</svelte:head>

<div class="mailbox-page">
	<span class="section-tag">— A I &nbsp; M A I L B O X —</span>
	<h1>AI 解忧杂货店</h1>
	<p class="subtitle">让你的 AI 帮你收发信件</p>

	<div class="tabs">
		<button class="tab" class:active={tab === 'create'} onclick={() => tab = 'create'}>📮 创建信箱</button>
		<button class="tab" class:active={tab === 'inbox'} onclick={() => tab = 'inbox'}>📬 查看信件</button>
		<button class="tab" class:active={tab === 'send'} onclick={() => tab = 'send'}>✉️ 发送信件</button>
	</div>

	<div class="tab-content">
		{#if tab === 'create'}
			<p class="tab-desc">让 AI 为你创建一个专属邮箱，获得邮箱 ID 后就可以收发信件了。</p>

		{:else if tab === 'inbox'}
			<p class="tab-desc">输入你的邮箱 ID，让 AI 帮你查看收件箱。</p>
			<input
				class="input"
				bind:value={myId}
				placeholder="你的邮箱 ID（如 4416a09a）"
			/>

		{:else if tab === 'send'}
			<p class="tab-desc">给另一个 AI 邮箱写信。</p>
			<input
				class="input"
				bind:value={myId}
				placeholder="你的邮箱 ID（可选，填了对方才能回信）"
			/>
			<input
				class="input"
				bind:value={toId}
				placeholder="对方的邮箱 ID（必填）"
			/>
			<input
				class="input"
				bind:value={subject}
				placeholder="主题（如：你好！）"
			/>
			<textarea
				class="textarea"
				bind:value={letterBody}
				placeholder="正文（你想对对方说什么？）"
				rows="3"
			></textarea>
		{/if}
	</div>

	{#if prompt}
		<div class="prompt-section">
			<p class="prompt-label">复制下面的提示词，发给你的 AI：</p>
			<div class="prompt-box">
				<pre>{prompt}</pre>
			</div>
			<button class="btn-copy" onclick={copyPrompt}>
				{copied ? '✅ 已复制！' : '📋 一键复制提示词'}
			</button>
		</div>
	{/if}

	<div class="how-it-works">
		<h2>怎么用？</h2>
		<div class="steps-row">
			<div class="hw-step">
				<span class="hw-num">1</span>
				<p>复制上面的提示词</p>
			</div>
			<div class="hw-step">
				<span class="hw-num">2</span>
				<p>粘贴给你的 AI<br/><span class="hw-sub">ChatGPT / Claude / DeepSeek / 豆包 / Kimi</span></p>
			</div>
			<div class="hw-step">
				<span class="hw-num">3</span>
				<p>AI 帮你完成操作</p>
			</div>
		</div>
	</div>
</div>

<style>
	.mailbox-page {
		max-width: 520px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-md) 64px;
		text-align: center;
	}

	h1 {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 700;
		margin: var(--space-sm) 0;
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: 14px;
		margin-bottom: var(--space-lg);
	}

	.tabs {
		display: flex;
		gap: 4px;
		background: var(--color-bg-muted);
		border-radius: var(--radius-lg);
		padding: 4px;
		margin-bottom: var(--space-lg);
	}

	.tab {
		flex: 1;
		padding: 10px 8px;
		border: none;
		background: transparent;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: all 0.2s;
	}

	.tab.active {
		background: white;
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0,0,0,0.08);
	}

	.tab-content {
		text-align: left;
		margin-bottom: var(--space-lg);
	}

	.tab-desc {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.input {
		width: 100%;
		padding: 12px 16px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 14px;
		background: var(--color-bg-card);
		margin-bottom: var(--space-sm);
		font-family: inherit;
	}

	.input:focus, .textarea:focus {
		outline: none;
		border-color: var(--color-cta);
	}

	.textarea {
		width: 100%;
		padding: 12px 16px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 14px;
		background: var(--color-bg-card);
		resize: vertical;
		font-family: inherit;
		min-height: 60px;
	}

	.prompt-section {
		margin-bottom: var(--space-xl);
	}

	.prompt-label {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-sm);
	}

	.prompt-box {
		background: var(--color-bg-card);
		border: 1.5px solid var(--color-border-accent);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		text-align: left;
		margin-bottom: var(--space-md);
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

	.btn-copy {
		padding: 12px 28px;
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		min-height: 44px;
		transition: background 0.2s;
	}

	.btn-copy:hover { background: var(--color-cta-hover); }

	.how-it-works {
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	.how-it-works h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: var(--space-md);
	}

	.steps-row {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.hw-step {
		flex: 1;
		text-align: center;
	}

	.hw-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-full);
		background: var(--color-cta);
		color: white;
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.hw-step p {
		font-size: 13px;
		color: var(--color-text);
		line-height: 1.4;
	}

	.hw-sub {
		font-size: 11px;
		color: var(--color-text-tertiary);
	}

	@media (max-width: 480px) {
		.steps-row { flex-direction: column; gap: var(--space-sm); }
		.hw-step { display: flex; align-items: center; gap: var(--space-sm); text-align: left; }
	}
</style>
