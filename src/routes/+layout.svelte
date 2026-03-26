<script lang="ts">
	import '$lib/styles/global.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onMount } from 'svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
	<meta property="og:site_name" content="PunkGo Roast" />
	<meta name="description" content="Five questions. Sixteen breeds. Sixty seconds. Discover your AI personality — which dog matches your vibe?" />
	<meta name="theme-color" content="#F5F0E8" />
</svelte:head>

<nav class="nav">
	<a href="/" class="logo">P U N K G O &nbsp; R O A S T</a>
	<div class="nav-right">
		<a href="/dogs" class="nav-link">{isZh ? '16 犬种' : '16 Dogs'}</a>
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 48px;
		height: 56px;
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-bg);
	}
	.logo {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-accent);
		letter-spacing: 0.4em;
		min-height: 44px;
		display: flex;
		align-items: center;
	}
	.nav-right {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.nav-right a {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-secondary);
		min-height: 44px;
		display: flex;
		align-items: center;
		padding: 0 8px;
	}
	.nav-right a:hover { color: var(--color-text); }
	.nav-right a.ext-btn {
		background: var(--color-cta);
		color: #FFFFFF;
		padding: 10px 18px;
		border-radius: 100px;
		font-weight: 700;
		font-size: 13px;
		min-height: 44px;
		box-shadow: 0 2px 8px rgba(90,140,106,0.3);
		animation: subtlePulse 3s ease-in-out infinite;
	}
	.ext-btn:hover { opacity: 0.9; }

	main {
		min-height: calc(100vh - 56px);
	}

	@keyframes subtlePulse {
		0%, 100% { box-shadow: 0 2px 8px rgba(90,140,106,0.3); }
		50% { box-shadow: 0 2px 16px rgba(90,140,106,0.5); }
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-right a.ext-btn { animation: none; }
	}
	@media (max-width: 639px) {
		.nav { padding: 0 16px; }
		.nav-right { gap: 8px; }
	}
</style>
