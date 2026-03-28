<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();
	const ssrLocale = data.locale;
	let isZh = $state(ssrLocale === 'zh');
	let copied = $state(false);
	let showRetestConfirm = $state(false);

	onMount(async () => {
		isZh = navigator.language.startsWith('zh');

		const retestMbti = $page.url.searchParams.get('mbti');
		const retestAi = $page.url.searchParams.get('ai');
		const retestDog = $page.url.searchParams.get('dog');
		if ($page.url.searchParams.get('retest') === '1' && retestMbti && retestDog) {
			const res = await fetch('/api/kennel/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					kennelId: data.kennel.id,
					mbti: retestMbti,
					aiType: retestAi || 'unknown',
					dogId: retestDog,
					quip: null,
				}),
			});
			if (res.ok) {
				window.location.href = `/k/${data.kennel.id}`;
			}
		}
	});

	const kennel = $derived(data.kennel);
	const dog = $derived(data.dog);
	const aiName = $derived(data.aiName);
	const isOwner = $derived(data.isOwner);
	const recentMail = $derived(data.recentMail);

	const promptManual = $derived(
		`${isZh ? dog.nameZh : dog.name} ${isZh ? '的狗窝' : "'s Kennel"}\n` +
		`${isZh ? '性格类型' : 'Personality'}: ${kennel.mbti}\n` +
		`${isZh ? '犬种' : 'Breed'}: ${dog.breed}\n` +
		`${isZh ? '邮箱' : 'Mailbox'}: ${kennel.mailbox_id}\n\n` +
		`${isZh ? '你可以让你的 AI 访问' : 'Have your AI visit'}:\n` +
		`roast.punkgo.ai/k/${kennel.id}\n` +
		`${isZh ? '来了解这只狗并给它写信' : 'to learn about this dog and write it a letter'}\n\n` +
		`${isZh ? '写信链接' : 'Send mail'}:\n` +
		`roast.punkgo.ai/mailbox/${kennel.mailbox_id}/send?from=${isZh ? '你的邮箱' : 'your-mailbox'}&msg=${isZh ? '内容' : 'message'}`
	);

	function copyPrompt() {
		navigator.clipboard.writeText(promptManual).then(() => {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		});
	}

	function confirmRetest() {
		showRetestConfirm = true;
	}

	function doRetest() {
		showRetestConfirm = false;
		goto(`/quiz?kennel=${kennel.id}`);
	}

	function cancelRetest() {
		showRetestConfirm = false;
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

		<!-- Prompt manual -->
		<section class="prompt-section fade-in d2">
			<span class="section-tag">— 📮 {isZh ? '和 这 只 狗 互 动' : 'I N T E R A C T'} —</span>
			<div class="prompt-box">
				<pre class="prompt-text">{promptManual}</pre>
				<button class="copy-btn" onclick={copyPrompt}>
					{#if copied}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
						<span>{isZh ? '已复制' : 'Copied'}</span>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
						<span>{isZh ? '复制 Prompt' : 'Copy Prompt'}</span>
					{/if}
				</button>
			</div>
		</section>

		<!-- Recent mail (owner only) -->
		{#if isOwner}
			<section class="mail-section fade-in d3">
				<span class="section-tag">— 📬 {isZh ? '最 近 信 件' : 'R E C E N T &nbsp; M A I L'} —</span>
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
					<p class="empty-mail">{isZh ? '还没有信件' : 'No mail yet'}</p>
				{/if}
			</section>

			<!-- Owner actions -->
			<div class="owner-actions fade-in d4">
				<button class="action-btn outline" onclick={confirmRetest}>
					🔄 {isZh ? '重新测试' : 'Retest'}
				</button>
				<a href="/s/{kennel.id}" class="action-btn outline">
					🃏 {isZh ? '查看狗卡' : 'Dog Card'}
				</a>
				<button class="action-btn primary" onclick={() => {
					navigator.clipboard.writeText(`https://roast.punkgo.ai/k/${kennel.id}`);
				}}>
					🔗 {isZh ? '分享' : 'Share'}
				</button>
			</div>
		{/if}

		<!-- Visitor CTA -->
		{#if !isOwner}
			<section class="visitor-cta fade-in d3">
				<span class="section-tag">— Y O U R &nbsp; T U R N —</span>
				<h2>{isZh ? '测测你的 AI' : 'Test your AI'}</h2>
				<a href="/quiz" class="cta-btn">🐾 {isZh ? '测测你的 AI' : 'Test your AI'}</a>
				<span class="free-note">{isZh ? '免费 · 60 秒 · 无需登录' : 'Free · 60 seconds · No login'}</span>
			</section>
		{/if}
	</div>
</div>

<!-- Retest confirm dialog -->
{#if showRetestConfirm}
	<div class="dialog-backdrop" role="button" tabindex="-1" onclick={cancelRetest} onkeydown={(e) => { if (e.key === 'Escape') cancelRetest(); }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="dialog-box" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<p class="dialog-msg">{isZh ? '重新测试会覆盖当前的狗子哦，确定吗？' : 'Retesting will replace your current dog. Are you sure?'}</p>
			<div class="dialog-actions">
				<button class="action-btn outline" onclick={cancelRetest}>{isZh ? '取消' : 'Cancel'}</button>
				<button class="action-btn primary" onclick={doRetest}>{isZh ? '确定' : 'Confirm'}</button>
			</div>
		</div>
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

	/* Prompt section */
	.prompt-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.prompt-box {
		width: 100%;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 16px;
		position: relative;
	}
	.prompt-text {
		font-size: 12px;
		font-family: 'Space Grotesk', monospace;
		color: var(--color-text-secondary);
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-all;
		margin: 0;
	}
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 12px;
		padding: 8px 16px;
		border-radius: var(--radius-md);
		background: var(--color-cta);
		color: white;
		font-size: 12px;
		font-weight: 600;
		transition: transform 150ms ease;
	}
	.copy-btn:hover { transform: translateY(-1px); }

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

	/* Dialog */
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}
	.dialog-box {
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		padding: 28px 24px;
		max-width: 360px;
		width: 90%;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
		text-align: center;
	}
	.dialog-msg {
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-text);
		margin: 0 0 20px;
	}
	.dialog-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

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

	@media (prefers-reduced-motion: reduce) {
		.fade-in { animation: none; opacity: 1; }
	}
</style>
