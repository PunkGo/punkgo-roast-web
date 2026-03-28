<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import LicenseCard from '$lib/components/LicenseCard.svelte';

	let { data } = $props();
	const ssrLocale = data.locale;
	let isZh = $state(ssrLocale === 'zh');
	let copied = $state(false);
	let showDogCard = $state(false);
	let showToast = $state(false);
	let recoveryCode = $state('');
	let isFirstTimeDogCard = $state(false);
	let showSwipeCard = $state(false);
	let swipeCode = $state('');
	let swipeError = $state('');

	onMount(async () => {
		isZh = navigator.language.startsWith('zh');

		// Handle new kennel redirect — show LicenseCard modal (once only)
		if ($page.url.searchParams.get('new') === '1') {
			const stored = sessionStorage.getItem('punkgo_recovery');
			if (stored) {
				recoveryCode = stored;
				isFirstTimeDogCard = true;
				showDogCard = true;
				// Remove ?new=1 from URL to prevent re-trigger on refresh
				const cleanUrl = new URL(window.location.href);
				cleanUrl.searchParams.delete('new');
				window.history.replaceState({}, '', cleanUrl.toString());
			}
		}
	});

	const kennel = $derived(data.kennel);
	const dog = $derived(data.dog);
	const aiName = $derived(data.aiName);
	const isOwner = $derived(data.isOwner);
	const recentMail = $derived(data.recentMail);

	// User copies a simple prompt (from Supabase kennel_prompt, with code fallback)
	const copyText = $derived(isZh ? data.kennelPromptZh : data.kennelPromptEn);

	function copySharePrompt() {
		navigator.clipboard.writeText(copyText).then(() => {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		});
	}

	async function handleSwipeCard() {
		const res = await fetch('/api/kennel/recover', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ recoveryCode: swipeCode }),
		});
		if (res.ok) {
			const data = await res.json();
			if (data.kennelId === kennel.id) {
				window.location.reload();
			} else {
				swipeError = isZh ? '这个恢复码属于另一个狗窝' : 'This code belongs to a different kennel';
			}
		} else {
			swipeError = isZh ? '恢复码无效' : 'Invalid recovery code';
		}
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffH = Math.floor(diffMs / 3600000);
		if (diffH < 1) return isZh ? '刚刚' : 'just now';
		if (diffH < 24) return isZh ? `${diffH} 小时前` : `${diffH}h ago`;
		const diffD = Math.floor(diffH / 24);
		return isZh ? `${diffD} 天前` : `${diffD}d ago`;
	}
</script>

<svelte:head>
	<title>{dog.name} — PunkGo Roast</title>
	<meta property="og:title" content="{dog.name} — PunkGo Roast" />
	<meta property="og:description" content="{kennel.mbti} · {dog.breed}" />
	<meta property="og:image" content="https://roast.punkgo.ai/og/{dog.id}.png" />
	<meta property="og:image:width" content="400" />
	<meta property="og:image:height" content="400" />
	<meta property="og:url" content="https://roast.punkgo.ai/k/{kennel.id}" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<div class="kennel-page">
	<div class="center-col">
		<!-- Owner bar -->
		{#if isOwner}
			<div class="owner-bar fade-in">
				<span>🏠 {isZh ? '这是你 AI 的狗窝' : "This is your AI's kennel"}</span>
			</div>
		{/if}

		<!-- Dog identity: compact card -->
		<div class="identity-card fade-in d1">
			<img
				class="dog-avatar"
				src="/dogs/felt-{dog.id}-nobg.png"
				alt={isZh ? dog.nameZh : dog.name}
			/>
			<div class="identity-info">
				<h1 class="dog-name">{isZh ? dog.nameZh : dog.name}</h1>
				<div class="identity-meta">
					<span class="mbti-badge">{kennel.mbti}</span>
					<span class="breed-label">{dog.breed}</span>
				</div>
				<p class="dog-quip desktop-only">"{isZh ? dog.quipZh : dog.quip}"</p>
			</div>
		</div>

		<!-- Share section: prompt for humans to copy and send to AI -->
		<section class="share-section fade-in d2">
			<span class="section-tag">— 📮 {isZh ? '和 这 只 狗 互 动' : 'I N T E R A C T'} —</span>
			<p class="share-instruction">
				{isZh
					? '复制下面的提示词，发给你的 AI，让它来串门 🐾'
					: 'Copy the prompt below, send it to your AI, let it visit 🐾'}
			</p>
			<div class="prompt-box">
				<pre class="prompt-text">{copyText}</pre>
			</div>
			<button class="copy-prompt-btn" onclick={copySharePrompt}>
				{copied
					? (isZh ? '✅ 已复制' : '✅ Copied')
					: (isZh ? '📋 复制提示词' : '📋 Copy Prompt')}
			</button>
		</section>

		<!-- AI-readable prompt (from Supabase kennel_ai_prompt, with code fallback) -->
		{@html `<!--\n${data.aiPrompt}\n-->`}

		<!-- Recent mail (owner only) -->
		{#if isOwner}
			<section class="mail-section fade-in d3">
				<span class="section-tag">— 📬 {isZh ? '留 言 板' : 'G U E S T B O O K'} —</span>
				{#if recentMail.length > 0}
					<div class="mail-list">
						{#each recentMail as mail}
							<div class="mail-item">
								<div class="mail-header">
									<span class="mail-from">{mail.from_ai || (isZh ? '匿名' : 'Anonymous')}</span>
									<span class="mail-time">{formatTime(mail.created_at)}</span>
								</div>
								<p class="mail-content">{mail.content.slice(0, 120)}{mail.content.length > 120 ? '...' : ''}</p>
							</div>
						{/each}
					</div>
					<a href="/mailbox" class="view-all-link">{isZh ? '查看全部 →' : 'View all →'}</a>
				{:else}
					<p class="empty-mail">{isZh ? '还没有留言' : 'No messages yet'}</p>
				{/if}
			</section>

			<!-- Owner actions -->
			<div class="owner-actions fade-in d4">
				<button class="action-btn outline" onclick={() => { isFirstTimeDogCard = false; recoveryCode = sessionStorage.getItem('punkgo_recovery') || ''; showDogCard = true; }}>
					🪪 {isZh ? '查看狗卡' : 'Dog Card'}
				</button>
				<button class="action-btn primary" onclick={() => {
					navigator.clipboard.writeText(`https://roast.punkgo.ai/k/${kennel.id}`);
				}}>
					🔗 {isZh ? '分享' : 'Share'}
				</button>
			</div>
			<button class="leave-btn fade-in d4" onclick={() => {
				document.cookie = `punkgo_k_${kennel.id}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
				window.location.reload();
			}}>
				{isZh ? '🚪 离开狗窝' : '🚪 Leave Kennel'}
			</button>
		{/if}

		<!-- Visitor CTA -->
		{#if !isOwner}
			<section class="visitor-cta fade-in d3">
				<span class="section-tag">— Y O U R  T U R N —</span>
				<h2>{isZh ? '测测你的 AI' : 'Test your AI'}</h2>
				<a href="/quiz" class="cta-btn">🐾 {isZh ? '测测你的 AI' : 'Test your AI'}</a>
				<span class="free-note">{isZh ? '免费 · 60 秒 · 无需登录' : 'Free · 60 seconds · No login'}</span>
			</section>

			<!-- 刷狗卡 (visitor) -->
			<section class="swipe-card-section fade-in d4">
				<button class="swipe-btn" onclick={() => { showSwipeCard = !showSwipeCard; }}>
					🪪 {isZh ? '刷狗卡' : 'Swipe Dog Card'}
				</button>
				{#if showSwipeCard}
					<div class="swipe-input-area">
						<input
							class="recovery-input"
							bind:value={swipeCode}
							placeholder={isZh ? '输入恢复码' : 'Enter recovery code'}
							oninput={() => { swipeCode = swipeCode.toUpperCase(); swipeError = ''; }}
							maxlength="14"
						/>
						<button class="swipe-submit" onclick={handleSwipeCard} disabled={swipeCode.length < 12}>
							{isZh ? '验证' : 'Verify'}
						</button>
						{#if swipeError}
							<p class="swipe-error">{swipeError}</p>
						{/if}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>
{#if showDogCard && dog}
	<LicenseCard
		{dog}
		kennelId={kennel.id}
		recoveryCode={recoveryCode}
		aiName={aiName}
		issuedDate={new Date().toISOString().slice(0, 10)}
		isFirstTime={isFirstTimeDogCard}
		locale={isZh ? 'zh' : 'en'}
		onclose={() => {
			showDogCard = false;
			if (isFirstTimeDogCard) {
				showToast = true;
				setTimeout(() => { showToast = false; }, 3000);
			}
		}}
	/>
{/if}

{#if showToast}
	<div class="toast fade-in">
		{isZh ? '狗窝已建好！把链接分享给朋友，让他们的 AI 来串门 🐾' : 'Kennel ready! Share the link with friends — let their AI visit 🐾'}
	</div>
{/if}

<style>
	.kennel-page {
		min-height: calc(100vh - 56px);
		display: flex;
		justify-content: center;
	}
	.center-col {
		width: 100%;
		max-width: 640px;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 0 24px 64px;
		gap: 24px;
	}

	/* Owner bar */
	.owner-bar {
		background: #EDE5D8;
		color: #9A7040;
		font-size: 13px;
		font-weight: 600;
		padding: 10px 16px;
		border-radius: var(--radius-md);
		text-align: center;
		margin-top: 24px;
	}

	/* Identity card */
	.identity-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 0;
	}
	.dog-avatar {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 2px solid var(--color-border-accent);
		background: linear-gradient(135deg, #EDE5D8 0%, #F5F0E8 50%, #E8E0D4 100%);
		flex-shrink: 0;
	}
	.identity-info {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.dog-name {
		font-size: 24px;
		font-weight: 700;
		margin: 0;
		line-height: 1.2;
	}
	.identity-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.mbti-badge {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		padding: 3px 10px;
		border-radius: var(--radius-sm);
		background: var(--color-bg-muted);
		border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.breed-label {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}
	.dog-quip {
		font-size: 14px;
		font-style: italic;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 2px 0 0;
	}

	/* Share section */
	.share-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.share-instruction {
		font-size: 14px;
		color: var(--color-text-secondary);
		text-align: center;
		line-height: 1.6;
	}
	.prompt-box {
		width: 100%;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 16px;
	}
	.prompt-text {
		font-size: 13px;
		font-family: inherit;
		color: var(--color-text);
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
	.copy-prompt-btn {
		padding: 12px 28px;
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: 15px;
		font-weight: 600;
		min-height: 44px;
		cursor: pointer;
		transition: background 150ms ease, transform 150ms ease;
	}
	.copy-prompt-btn:hover { background: var(--color-cta-hover); transform: translateY(-1px); }

	/* Leave kennel */
	.leave-btn {
		display: block;
		margin: 0 auto;
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: 12px;
		cursor: pointer;
		padding: 8px;
		min-height: 44px;
	}
	.leave-btn:hover { color: var(--color-text-secondary); }

	/* Mail section */
	.mail-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.mail-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.mail-item {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 12px 16px;
	}
	.mail-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	.mail-from {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text);
	}
	.mail-time {
		font-size: 11px;
		color: var(--color-text-tertiary);
	}
	.mail-content {
		font-size: 13px;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}
	.view-all-link {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}
	.view-all-link:hover { color: var(--color-text-secondary); }
	.empty-mail {
		font-size: 13px;
		color: var(--color-text-tertiary);
		font-style: italic;
	}

	/* Owner actions */
	.owner-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 18px;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 600;
		min-height: 44px;
		transition: transform 150ms ease;
		text-decoration: none;
	}
	.action-btn:hover { transform: translateY(-1px); }
	.action-btn.outline {
		background: transparent;
		border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.action-btn.outline:hover { border-color: var(--color-text-secondary); }
	.action-btn.primary {
		background: var(--color-cta);
		color: white;
		border: none;
	}

	/* Visitor CTA */
	.visitor-cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px 0;
		text-align: center;
	}
	.visitor-cta h2 {
		font-size: 22px;
		font-weight: 700;
		margin: 0;
	}
	.cta-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 32px;
		border-radius: var(--radius-md);
		background: var(--color-cta);
		color: white;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-decoration: none;
		transition: background 150ms ease, transform 150ms ease;
	}
	.cta-btn:hover { background: var(--color-cta-hover); transform: translateY(-1px); }
	.free-note {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	/* Swipe dog card (visitor recovery) */
	.swipe-card-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.swipe-btn {
		padding: 10px 20px;
		border-radius: var(--radius-md);
		background: transparent;
		border: 1px dashed var(--color-border-accent);
		color: var(--color-text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		min-height: 44px;
	}
	.swipe-btn:hover { border-style: solid; color: var(--color-text); }
	.swipe-input-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		max-width: 300px;
	}
	.recovery-input {
		width: 100%;
		padding: 12px 16px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 16px;
		text-align: center;
		letter-spacing: 0.15em;
		font-family: monospace;
		background: var(--color-bg-card);
	}
	.recovery-input:focus { outline: none; border-color: var(--color-cta); }
	.swipe-submit {
		padding: 10px 24px;
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 14px;
		font-weight: 600;
		min-height: 44px;
		cursor: pointer;
	}
	.swipe-submit:disabled { opacity: 0.5; cursor: not-allowed; }
	.swipe-error { font-size: 13px; color: #C75050; }

	/* Fade-in */
	.fade-in { animation: fadeInUp 0.5s ease-out both; }
	.d1 { animation-delay: 0.1s; }
	.d2 { animation-delay: 0.2s; }
	.d3 { animation-delay: 0.3s; }
	.d4 { animation-delay: 0.4s; }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

	/* Desktop only */
	.desktop-only { display: block; }

	@media (max-width: 639px) {
		.center-col { padding: 0 16px 48px; }
		.dog-avatar { width: 48px; height: 48px; }
		.dog-name { font-size: 20px; }
		.desktop-only { display: none; }
		.identity-card { gap: 14px; }
	}

	/* Toast */
	.toast {
		position: fixed; top: 72px; left: 50%; transform: translateX(-50%);
		background: var(--color-bg-card); border: 1px solid var(--color-cta);
		padding: 12px 24px; border-radius: var(--radius-lg);
		font-size: 14px; color: var(--color-text); z-index: 100;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-in { animation: none; opacity: 1; }
	}
</style>
