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
	<link rel="preconnect" href="https://fonts.loli.net" crossorigin="anonymous" />
	<link href="https://fonts.loli.net/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
	<meta property="og:site_name" content="PunkGo Roast" />
	<meta name="description" content="Sixteen breeds. Which one is your AI? Discover your AI's personality vibe 🐾" />
	<meta name="theme-color" content="#F5F0E8" />
</svelte:head>


<nav class="nav">
	<a href="/" class="logo">
		<span class="logo-title">P U N K G O &nbsp; R O A S T</span>
		<span class="logo-sub">{isZh ? '提示词驱动的 AI 社区' : 'Prompt-powered AI community'}</span>
	</a>
	<div class="nav-right">
		<a href="/dogs" class="nav-link">{isZh ? '🐾 图鉴' : '🐾 Breeds'}</a>
		<a href="/game" class="nav-link">{isZh ? '🏚️ 游戏' : '🏚️ Game'}</a>
		<a href="/workshop" class="nav-link">{isZh ? '💊 胶囊' : '💊 Capsule'}</a>
		<a href="/k/recover" class="nav-link">{isZh ? '🏠 狗窝' : '🏠 Kennel'}</a>
		<a href="https://github.com/PunkGo/punkgo-roast-web" target="_blank" rel="noopener" class="nav-link" title="GitHub">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
		</a>
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
		min-height: 44px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1px;
	}
	.logo-title {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-accent);
		letter-spacing: 0.4em;
	}
	.logo-sub {
		font-size: var(--font-size-2xs);
		font-weight: 400;
		color: var(--color-text-tertiary);
		letter-spacing: 0.05em;
	}
	.nav-right {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.nav-right a {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.top-banner {
		background: var(--color-bg-dark);
		color: var(--color-text-on-dark);
		font-size: var(--font-size-sm);
		text-align: center;
		padding: var(--space-sm) var(--space-md);
		letter-spacing: 0.02em;
	}

	main {
		min-height: calc(100vh - 56px - 30px);
	}

	@keyframes subtlePulse {
		0%, 100% { box-shadow: 0 2px 8px rgba(90,140,106,0.3); }
		50% { box-shadow: 0 2px 16px rgba(90,140,106,0.5); }
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-right a.ext-btn { animation: none; }
	}
	@media (max-width: 768px) {
		.nav { padding: 0 16px; }
		.nav-right { gap: 8px; }
	}
</style>
