<script lang="ts">
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
	<meta property="og:site_name" content="PunkGo Roast" />
	<meta name="theme-color" content="#F5F0E8" />
</svelte:head>

<nav class="nav">
	<a href="/" class="logo">P U N K G O &nbsp; R O A S T</a>
	<div class="nav-right">
		<a href="/dogs">16 Dogs</a>
		<a href="https://github.com/PunkGo/punkgo-roast-extension" target="_blank" class="ext-btn">Get Extension</a>
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
	}
	.nav-right {
		display: flex;
		gap: 28px;
		align-items: center;
	}
	.nav-right a {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.nav-right a:hover { color: var(--color-text); }
	.ext-btn {
		background: var(--color-bg-dark);
		color: var(--color-text-on-dark) !important;
		padding: 6px 16px;
		border-radius: var(--radius-md);
		font-weight: 600 !important;
		font-size: 11px !important;
	}
	.ext-btn:hover { opacity: 0.9; }

	main {
		min-height: calc(100vh - 56px);
	}

	@media (max-width: 639px) {
		.nav { padding: 0 16px; }
		.nav-right { gap: 16px; }
	}
</style>
