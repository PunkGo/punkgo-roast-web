<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { copyToClipboard } from '$lib/utils/copy';
	import { generateQRDataURL } from '$lib/utils/qrcode';

	let { data } = $props();
	const ssrLocale = data.locale;
	let isZh = $state(ssrLocale === 'zh');
	let copied = $state(false);
	let shareCopied = $state(false);
	let showDogCard = $state(false);
	let qrDataURL = $state('');
	let dcCardRef: HTMLElement | null = $state(null);

	async function openDogCard() {
		showDogCard = true;
		if (!qrDataURL) {
			qrDataURL = await generateQRDataURL(`https://roast.punkgo.ai/k/${kennel.id}/web`);
		}
	}

	let savePreviewUrl = $state('');
	const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

	async function saveDogCard() {
		if (!dcCardRef) return;
		const html2canvas = (await import('html2canvas')).default;
		const canvas = await html2canvas(dcCardRef, { scale: 2, useCORS: true, backgroundColor: null });
		const url = canvas.toDataURL('image/png');

		if (isMobile) {
			// Mobile: show image for long-press save
			savePreviewUrl = url;
		} else {
			const link = document.createElement('a');
			link.download = `punkgo-dogcard-${kennel.nickname || kennel.id}.png`;
			link.href = url;
			link.click();
		}
	}

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		// Clean up ?new=1 from URL
		if ($page.url.searchParams.get('new') === '1') {
			const cleanUrl = new URL(window.location.href);
			cleanUrl.searchParams.delete('new');
			window.history.replaceState({}, '', cleanUrl.toString());
		}
	});

	const kennel = $derived(data.kennel);
	const dog = $derived(data.dog);
	const aiName = $derived(data.aiName);
	const isOwner = $derived(data.isOwner);
	const subjects = $derived(data.subjects);
	const kennelQuipParts = $derived((kennel?.quip || '').split('|'));
	const kennelIntro = $derived(kennelQuipParts.length > 1 ? kennelQuipParts[0] : null);
	const kennelQuip = $derived(kennelQuipParts.length > 1 ? kennelQuipParts.slice(1).join('|') : kennel?.quip);

	// User copies a simple prompt (from Supabase kennel_prompt, with code fallback)
	const copyText = $derived(isZh ? data.kennelPromptZh : data.kennelPromptEn);

	function copySharePrompt() {
		copyToClipboard(copyText).then(() => {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		});
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

		<!-- Title -->
		<h1 class="kp-title fade-in">
			{kennel.nickname || (isZh ? dog.nameZh : dog.name)}{isZh ? '的狗窝' : "'s Kennel"}
		</h1>

		<!-- Hero: Dog + quip cloud -->
		<section class="kp-hero fade-in d1">
			<div class="kp-dog-wrap">
				<img class="kp-dog-img" src="/dogs/felt-{dog.id}-chat.png" alt={kennel.nickname || dog.name} />
			</div>
			{#if kennelQuip}
				<div class="kp-quip-cloud">
					{#if kennelIntro}
						<span class="kp-quip-label">{kennelIntro}</span>
					{/if}
					<span class="kp-quip-text">"{kennelQuip}"</span>
				</div>
			{/if}
		</section>

		<!-- Profile info -->
		<section class="kp-profile fade-in d1">
			<span class="kp-nickname">{kennel.nickname || (isZh ? dog.nameZh : dog.name)}</span>
			<div class="kp-meta">
				<span class="kp-breed">{isZh ? dog.breedZh : dog.breed}</span>
				<span class="kp-mbti-small">{kennel.mbti}</span>
			</div>
			<span class="kp-traits">{isZh ? dog.traitsZh : dog.traits}</span>
		</section>

		<!-- Prompt -->
		<section class="kp-prompt fade-in d2">
			<button class="kp-prompt-toggle" onclick={copySharePrompt}>
				{copied
					? (isZh ? '✅ 已复制提示词' : '✅ Copied')
					: (isZh ? '📋 让你的 AI 来串门' : '📋 Invite your AI to visit')}
			</button>
		</section>

		<!-- Actions -->
		<section class="kp-actions fade-in d3">
			{#if isOwner}
				<button class="kp-btn secondary" onclick={openDogCard}>
					🪪 {isZh ? '查看狗证' : 'Dog Card'}
				</button>
				<button class="kp-btn primary" onclick={async () => {
					await copyToClipboard(`https://roast.punkgo.ai/k/${kennel.id}/web`);
					shareCopied = true;
					setTimeout(() => { shareCopied = false; }, 2000);
				}}>
					{shareCopied
						? (isZh ? '✅ 链接已复制' : '✅ Link Copied')
						: (isZh ? '🔗 分享狗窝' : '🔗 Share Kennel')}
				</button>
				<button class="kp-btn outline" onclick={() => {
					document.cookie = `punkgo_k_${kennel.id}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
					window.location.reload();
				}}>
					{isZh ? '离开' : 'Leave'}
				</button>
			{:else}
				<a href="/quiz" class="kp-btn primary">
					🐾 {isZh ? '测测你的 AI' : 'Test your AI'}
				</a>
				<span class="kp-free">{isZh ? '免费 · 60 秒 · 无需登录' : 'Free · 60 seconds · No login'}</span>
			{/if}
		</section>

		<div class="kp-footer">
			<a href="/legal">{isZh ? '免责声明与隐私' : 'Disclaimer & Privacy'}</a>
		</div>
	</div>
</div>

{#if showDogCard && dog}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="dc-overlay" onclick={() => { showDogCard = false; }}>
		<div class="dc-modal" onclick={(e) => e.stopPropagation()}>
			<div class="dc-card" bind:this={dcCardRef}>
				<div class="dc-left">
					<img src="/dogs/felt-{dog.id}-chat.png" alt={kennel.nickname || dog.name} />
				</div>
				<div class="dc-right">
					<div class="dc-top">
						<div class="dc-header">
							<span class="dc-brand">{isZh ? '胖狗' : 'PUNKGO'}</span>
							<span class="dc-mbti">{kennel.mbti}</span>
						</div>
						<span class="dc-name">{kennel.nickname || (isZh ? dog.nameZh : dog.name)}</span>
						<span class="dc-breed">{isZh ? dog.breedZh : dog.breed}</span>
					</div>
					<div class="dc-divider"></div>
					<div class="dc-bottom">
						{#if qrDataURL}
							<img class="dc-qr-img" src={qrDataURL} alt="QR" />
						{:else}
							<div class="dc-qr-box"></div>
						{/if}
						<div class="dc-codes">
							<span class="dc-code">****-****-****</span>
							<span class="dc-url">roast.punkgo.ai/k/{kennel.id}/web</span>
						</div>
					</div>
				</div>
			</div>
			<div class="dc-actions">
				<button class="dc-save" onclick={saveDogCard}>
					💾 {isZh ? '下载狗证' : 'Save Card'}
				</button>
				<button class="dc-close" onclick={() => { showDogCard = false; }}>
					{isZh ? '关闭' : 'Close'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if savePreviewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="save-overlay" onclick={() => savePreviewUrl = ''}>
		<p class="save-hint">{isZh ? '长按图片保存 · 点击任意处关闭' : 'Long-press to save · Tap to close'}</p>
		<img src={savePreviewUrl} alt="dog card" class="save-preview-img" />
	</div>
{/if}

<style>
	.kennel-page {
		min-height: calc(100vh - 56px);
		display: flex; justify-content: center;
	}
	.center-col {
		width: 100%; max-width: 480px;
		display: flex; flex-direction: column; align-items: center;
		padding: 24px 20px 64px; gap: 0;
	}

	/* Hero */
	.kp-hero {
		display: flex; align-items: flex-end; gap: 0;
		width: 100%; position: relative;
		padding: 0 0 12px;
	}
	.kp-dog-wrap {
		width: 45%; display: flex; justify-content: center;
	}
	.kp-dog-img {
		width: 100%; max-height: 200px; object-fit: contain;
		filter: drop-shadow(0 6px 16px rgba(40,24,12,0.12));
	}
	.kp-quip-cloud {
		flex: 1;
		background: #fff;
		border-radius: 16px;
		padding: 12px 16px;
		box-shadow: 0 2px 10px rgba(40,24,12,0.06);
		position: relative;
		margin-bottom: 24px;
		display: flex; flex-direction: column; gap: 3px;
	}
	.kp-quip-cloud::before {
		content: ''; position: absolute; left: -6px; bottom: 20px;
		border: 5px solid transparent;
		border-right-color: #fff; border-left: 0;
	}
	.kp-quip-label {
		font-size: 9px; color: #A0907E; font-weight: 500;
	}
	.kp-quip-text {
		font-size: 13px; font-weight: 600; font-style: italic;
		color: #2A1810; line-height: 1.5;
	}

	/* Title */
	.kp-title {
		font-size: 22px; font-weight: 900; color: #2A1810;
		text-align: center; margin: 0 0 4px;
		line-height: 1.3;
	}

	/* Profile info */
	.kp-profile {
		text-align: center; padding: 4px 0 16px;
		display: flex; flex-direction: column; align-items: center; gap: 3px;
	}
	.kp-nickname {
		font-size: 18px; font-weight: 800; color: #2A1810;
	}
	.kp-meta {
		display: flex; align-items: center; gap: 8px;
	}
	.kp-breed {
		font-size: 12px; font-weight: 500; color: #A0907E;
	}
	.kp-mbti-small {
		font-size: 10px; font-weight: 600; color: #C08040;
		letter-spacing: 0.15em; opacity: 0.7;
	}
	.kp-traits {
		font-size: 11px; color: #A0907E;
		letter-spacing: 0.06em;
	}

	/* Prompt */
	.kp-prompt {
		width: 100%; padding: 12px 0;
	}
	.kp-prompt-toggle {
		width: 100%; padding: 14px;
		background: #fff; color: #2A1810;
		border: 1.5px solid #D4C9B8;
		border-radius: 12px;
		font-size: 14px; font-weight: 600;
		cursor: pointer; font-family: inherit;
		transition: background 150ms ease;
	}
	.kp-prompt-toggle:hover { background: #F5F0E8; }

	/* Actions */
	.kp-actions {
		width: 100%; padding: 16px 0;
		display: flex; flex-direction: column; align-items: center; gap: 10px;
	}
	.kp-btn {
		width: 100%; max-width: 300px; padding: 14px;
		border-radius: 12px;
		font-size: 15px; font-weight: 700;
		cursor: pointer; border: none;
		font-family: inherit; text-decoration: none;
		text-align: center; display: block;
	}
	.kp-btn.primary {
		background: #C08040; color: #fff;
		box-shadow: 0 4px 16px rgba(192,128,64,0.25);
	}
	.kp-btn.primary:hover { background: #A06830; }
	.kp-btn.outline {
		background: none; color: #A0907E;
		border: 1px solid #D4C9B8;
		font-size: 13px; padding: 10px;
	}
	.kp-free {
		font-size: 11px; color: #A0907E;
	}

	.kp-btn.secondary {
		background: #fff; color: #2A1810;
		border: 1.5px solid #D4C9B8;
		box-shadow: none;
	}
	.kp-btn.secondary:hover { background: #F5F0E8; }

	/* Dog card modal */
	.dc-overlay {
		position: fixed; inset: 0; z-index: 9000;
		background: rgba(0,0,0,0.5);
		display: flex; align-items: center; justify-content: center;
		padding: 20px; backdrop-filter: blur(4px);
	}
	.dc-modal {
		display: flex; flex-direction: column; align-items: center; gap: 12px;
	}
	.dc-card {
		width: 380px; max-width: 90vw; height: 190px;
		border-radius: 16px; overflow: hidden;
		display: flex;
		box-shadow: 0 8px 32px rgba(40,24,12,0.25);
		background: #F5F0E8;
	}
	.dc-left {
		width: 36%;
		display: flex; align-items: flex-end; justify-content: center;
		background: linear-gradient(170deg, #F8F2E8 0%, #EDE0C8 100%);
		padding: 0 0 4px 4px;
	}
	.dc-left img { width: 90%; object-fit: contain; }
	.dc-right {
		width: 64%;
		display: grid; grid-template-rows: 55fr 1px 45fr;
		background: linear-gradient(160deg, #F5F0E8 0%, #EDE5D8 100%);
	}
	.dc-top {
		padding: 0 14px;
		display: flex; flex-direction: column;
	}
	.dc-header {
		display: flex; justify-content: space-between; align-items: center;
		padding-top: 10px; margin-bottom: auto;
	}
	.dc-brand { font-size: 10px; font-weight: 700; color: #2A1810; letter-spacing: 0.15em; }
	.dc-mbti { font-size: 12px; font-weight: 800; color: #C08040; letter-spacing: 0.2em; }
	.dc-name { font-size: 20px; font-weight: 900; color: #2A1810; line-height: 1.1; }
	.dc-breed { font-size: 9px; color: #A0907E; margin-bottom: 10px; }
	.dc-divider { background: #E0D8CC; }
	.dc-bottom {
		padding: 0 14px;
		display: flex; align-items: center; gap: 8px;
	}
	.dc-qr-box {
		width: 44px; height: 44px;
		border-radius: 6px; background: #fff;
		border: 1px solid #E8E0D4; flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
	}
	.dc-qr-box::after { content: 'QR'; font-size: 9px; font-weight: 700; color: #D4C9B8; }
	.dc-qr-img {
		width: 44px; height: 44px;
		border-radius: 4px; flex-shrink: 0;
	}
	.dc-codes { display: flex; flex-direction: column; gap: 1px; }
	.dc-code { font-size: 11px; font-weight: 700; color: #A0907E; letter-spacing: 0.08em; }
	.dc-url { font-size: 7px; color: #A0907E; white-space: nowrap; }
	.dc-actions {
		display: flex; gap: 10px; align-items: center;
	}
	.dc-save {
		background: #C08040; color: #fff; border: none;
		padding: 10px 20px; border-radius: 10px;
		font-size: 14px; font-weight: 700;
		cursor: pointer; font-family: inherit;
	}
	.dc-save:hover { background: #A06830; }
	.dc-close {
		background: rgba(255,255,255,0.9); border: none;
		padding: 8px 20px; border-radius: 10px;
		font-size: 13px; font-weight: 600; color: #2A1810;
		cursor: pointer; font-family: inherit;
	}

	/* Save overlay (mobile long-press) */
	.save-overlay {
		position: fixed; inset: 0; z-index: 9999;
		background: rgba(0,0,0,0.8);
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 16px; padding: 20px;
	}
	.save-hint { color: white; font-size: 14px; text-align: center; }
	.save-preview-img { max-width: 90vw; max-height: 80vh; border-radius: 12px; }

	/* Footer */
	.kp-footer {
		padding: 24px 0 0;
		text-align: center;
	}
	.kp-footer a {
		font-size: 11px; color: #A0907E;
		text-decoration: none;
	}

	/* Animations */
	.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0; }
	.d1 { animation-delay: 0.1s; }
	.d2 { animation-delay: 0.2s; }
	.d3 { animation-delay: 0.3s; }
	@keyframes fadeIn { to { opacity: 1; } }
	@media (prefers-reduced-motion: reduce) {
		.fade-in { animation: none; opacity: 1; }
	}
</style>
