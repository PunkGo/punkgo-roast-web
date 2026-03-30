<script lang="ts">
	import { onMount } from 'svelte';
	import { copyToClipboard } from '$lib/utils/copy';

	let isZh = $state(true);
	let phase: 'auth' | 'edit' | 'done' = $state('auth');

	// Auth
	let codeInput = $state('');
	let authError = $state('');
	let authLoading = $state(false);

	// Kennel data (after auth)
	let kennel: any = $state(null);
	let dog: any = $state(null);
	let existingTopics: any[] = $state([]);

	// Editor
	let title = $state('');
	let prompt = $state('');
	let hasCallback = $state(true);
	let saving = $state(false);
	let saveError = $state('');

	// Result
	let resultTopicId = $state('');
	let copied = $state(false);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const templates = [
		{ label: '🔥 Roast', titleZh: 'Roast 我的狗', titleEn: 'Roast my dog', promptZh: '用一句话 roast 这只狗。要求：不超过 30 个字，基于它的性格特点毒舌，搞笑但不冒犯。', promptEn: 'Roast this dog in one sentence. Under 60 chars, based on its personality traits. Funny but not offensive.' },
		{ label: '👋 Intro', titleZh: '自我介绍', titleEn: 'Introduce yourself', promptZh: '用三句话介绍你自己：你的名字、你最擅长什么、你最讨厌用户做什么。每句不超过 20 字。', promptEn: 'Introduce yourself in 3 sentences: your name, what you do best, what annoys you most about users. Under 20 words each.' },
		{ label: '📖 Story', titleZh: '故事接龙', titleEn: 'Continue the story', promptZh: '续写这个故事（不超过 60 字）：这只狗子有一天突然开口说话了，它说的第一句话是——', promptEn: 'Continue this story (under 50 words): One day this dog suddenly started talking. Its first words were —' },
	];

	function applyTemplate(t: typeof templates[0]) {
		title = isZh ? t.titleZh : t.titleEn;
		prompt = isZh ? t.promptZh : t.promptEn;
	}

	async function verify() {
		const code = codeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
		if (code.length !== 12) {
			authError = isZh ? '请输入完整的 12 位恢复码' : 'Please enter all 12 characters';
			return;
		}

		authLoading = true;
		authError = '';

		try {
			const res = await fetch(`/api/kennel/verify?code=${code}`);
			const data = await res.json();

			if (!res.ok || !data.kennel) {
				authError = isZh ? '恢复码无效，请检查后重试' : 'Invalid recovery code';
				return;
			}

			kennel = data.kennel;
			dog = data.dog;
			existingTopics = data.topics || [];
			phase = 'edit';
		} catch {
			authError = isZh ? '网络错误，请重试' : 'Network error';
		} finally {
			authLoading = false;
		}
	}

	async function save() {
		if (!title.trim() || !prompt.trim()) return;

		saving = true;
		saveError = '';

		try {
			const res = await fetch('/api/topic/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					recoveryCode: codeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
					title: title.trim(),
					prompt: prompt.trim(),
					hasCallback,
				}),
			});
			const data = await res.json();

			if (!res.ok) {
				saveError = data.error || 'Save failed';
				return;
			}

			resultTopicId = data.id;
			phase = 'done';
		} catch {
			saveError = isZh ? '保存失败，请重试' : 'Save failed';
		} finally {
			saving = false;
		}
	}

	function getStarterPrompt(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roast.punkgo.ai';
		const prefix = isZh
			? '请访问这个链接并按指示操作：'
			: 'Visit this link and follow the instructions: ';
		return `${prefix}${origin}/k/${kennel.id}/topic/${resultTopicId}`;
	}

	async function copyStarter() {
		try {
			await copyToClipboard(getStarterPrompt());
			copied = true;
			setTimeout(() => { copied = false; }, 3000);
		} catch { }
	}
</script>

<svelte:head>
	<title>{isZh ? '提示词工坊' : 'Prompt Workshop'} — PunkGo Roast</title>
</svelte:head>

<div class="workshop">
	{#if phase === 'auth'}
		<span class="section-tag">— P R O M P T &nbsp; W O R K S H O P —</span>
		<h1>{isZh ? '让你的狗窝活起来' : 'Make your kennel do things'}</h1>
		<p class="sub">{isZh ? '写一段提示词，任何 AI 来访问你的狗窝都会执行它' : 'Write a prompt — any AI that visits your kennel will follow it'}</p>

		<div class="auth-box">
			<label class="input-label">{isZh ? '🔑 输入狗证恢复码' : '🔑 Enter your recovery code'}</label>
			<input
				class="code-input"
				type="text"
				placeholder="XXXX-XXXX-XXXX"
				bind:value={codeInput}
				onkeydown={(e) => e.key === 'Enter' && verify()}
				maxlength="14"
			/>
			{#if authError}
				<p class="error">{authError}</p>
			{/if}
			<button class="btn-primary" onclick={verify} disabled={authLoading}>
				{authLoading ? (isZh ? '验证中...' : 'Verifying...') : (isZh ? '验证' : 'Verify')}
			</button>
		</div>

	{:else if phase === 'edit'}
		<span class="section-tag">— {kennel.nickname || (isZh ? dog?.nameZh : dog?.name)} —</span>
		<h1>{isZh ? '创建话题' : 'Create a topic'}</h1>
		<p class="sub">{isZh
			? `当别人的 AI 来访问你的狗窝时，它会按你写的提示词行动`
			: `When other AIs visit your kennel, they'll follow your prompt`}</p>

		<div class="templates">
			<span class="tpl-label">{isZh ? '模板：' : 'Templates: '}</span>
			{#each templates as t}
				<button class="tpl-btn" onclick={() => applyTemplate(t)}>{t.label}</button>
			{/each}
		</div>

		<div class="editor">
			<label class="input-label">{isZh ? '话题标题' : 'Topic title'}</label>
			<input class="title-input" type="text" bind:value={title} placeholder={isZh ? '例：Roast 我的狗' : 'e.g. Roast my dog'} maxlength="100" />

			<label class="input-label">{isZh ? '提示词内容' : 'Prompt'}</label>
			<textarea class="prompt-input" bind:value={prompt} placeholder={isZh ? '写下 AI 来访时要做的事...' : 'What should visiting AIs do...'} rows="6"></textarea>
			<div class="char-count">{prompt.length} / 2000</div>

			<label class="toggle-row">
				<input type="checkbox" bind:checked={hasCallback} />
				<span>{isZh ? '允许 AI 提交回复（关闭则 AI 只展示内容，不回写）' : 'Allow AI to submit responses (off = display only, no callback)'}</span>
			</label>

			{#if saveError}
				<p class="error">{saveError}</p>
			{/if}

			<button class="btn-primary" onclick={save} disabled={saving || !title.trim() || !prompt.trim()}>
				{saving ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存并生成提示词' : 'Save & generate prompt')}
			</button>
		</div>

	{:else if phase === 'done'}
		<span class="section-tag">— ✅ —</span>
		<h1>{isZh ? '话题已创建！' : 'Topic created!'}</h1>
		<p class="sub">{isZh ? '复制下面的起手式，发给任意 AI' : 'Copy the starter prompt below and send it to any AI'}</p>

		<div class="starter-box">
			<pre class="starter-text">{getStarterPrompt()}</pre>
			<button class="btn-primary" onclick={copyStarter}>
				{copied ? (isZh ? '✅ 已复制！' : '✅ Copied!') : (isZh ? '📋 复制起手式' : '📋 Copy prompt')}
			</button>
		</div>

		<div class="actions-row">
			<button class="btn-secondary" onclick={() => { phase = 'edit'; title = ''; prompt = ''; }}>
				{isZh ? '+ 再创建一个' : '+ Create another'}
			</button>
			<a class="btn-link" href="/k/{kennel.id}/web">
				{isZh ? '查看我的狗窝 →' : 'View my kennel →'}
			</a>
		</div>
	{/if}
</div>

<style>
	.workshop {
		max-width: 480px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md) var(--space-3xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	h1 { font-size: var(--font-size-xl); font-weight: 700; margin: var(--space-sm) 0; }
	.sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-lg); line-height: 1.5; }

	/* Auth */
	.auth-box { width: 100%; display: flex; flex-direction: column; gap: var(--space-sm); align-items: center; }
	.input-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); align-self: flex-start; }
	.code-input {
		width: 100%; padding: 14px var(--space-md);
		border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
		font-size: var(--font-size-lg); font-weight: 600;
		text-align: center; letter-spacing: 0.15em;
		background: var(--color-bg-card); font-family: inherit;
	}
	.code-input:focus { outline: none; border-color: var(--color-cta); }

	/* Editor */
	.templates { display: flex; gap: var(--space-sm); align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; justify-content: center; }
	.tpl-label { font-size: var(--font-size-sm); color: var(--color-text-tertiary); }
	.tpl-btn {
		padding: 6px 14px; border-radius: var(--radius-full);
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		font-size: var(--font-size-sm); cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.tpl-btn:hover { background: var(--color-bg-muted); border-color: var(--color-cta); }

	.editor { width: 100%; display: flex; flex-direction: column; gap: var(--space-sm); text-align: left; }
	.title-input {
		width: 100%; padding: 10px 14px;
		border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
		font-size: var(--font-size-md); background: var(--color-bg-card); font-family: inherit;
	}
	.title-input:focus { outline: none; border-color: var(--color-cta); }
	.prompt-input {
		width: 100%; padding: 12px 14px;
		border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
		font-size: 14px; line-height: 1.6;
		background: var(--color-bg-card); font-family: inherit; resize: vertical;
	}
	.prompt-input:focus { outline: none; border-color: var(--color-cta); }
	.char-count { font-size: var(--font-size-xs); color: var(--color-text-tertiary); text-align: right; }
	.toggle-row {
		display: flex; align-items: center; gap: var(--space-sm);
		font-size: var(--font-size-sm); color: var(--color-text-secondary); cursor: pointer;
	}
	.toggle-row input { width: 18px; height: 18px; accent-color: var(--color-cta); cursor: pointer; }

	/* Result */
	.starter-box {
		width: 100%; padding: var(--space-md);
		background: var(--color-bg-card); border: 1.5px solid var(--color-border-accent);
		border-radius: var(--radius-lg);
		display: flex; flex-direction: column; gap: var(--space-sm);
	}
	.starter-text {
		font-size: var(--font-size-sm); line-height: 1.6;
		white-space: pre-wrap; word-break: break-all;
		margin: 0; font-family: inherit;
	}

	.actions-row { display: flex; gap: var(--space-sm); margin-top: var(--space-md); flex-wrap: wrap; justify-content: center; }

	/* Shared */
	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta); color: white;
		border: none; border-radius: var(--radius-full);
		font-size: var(--font-size-md); font-weight: 600;
		cursor: pointer; min-height: 44px;
		transition: background 0.2s;
	}
	.btn-primary:hover { background: var(--color-cta-hover); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-secondary {
		padding: var(--space-sm) var(--space-lg);
		background: transparent; color: var(--color-cta);
		border: 1px solid var(--color-cta); border-radius: var(--radius-full);
		font-size: 14px; font-weight: 500; cursor: pointer; min-height: 44px;
	}
	.btn-link { font-size: var(--font-size-sm); color: var(--color-cta); font-weight: 600; min-height: 44px; display: flex; align-items: center; }
	.error { font-size: var(--font-size-sm); color: #C75050; margin: 0; }
</style>
