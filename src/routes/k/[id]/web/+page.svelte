<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { copyToClipboard } from '$lib/utils/copy';

	let { data } = $props();
	const ssrLocale = data.locale;
	let isZh = $state(ssrLocale === 'zh');
	let copied = $state(false);

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
				<button class="kp-btn primary" onclick={() => {
					copyToClipboard(`https://roast.punkgo.ai/k/${kennel.id}/web`);
				}}>
					🔗 {isZh ? '分享狗窝' : 'Share Kennel'}
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
