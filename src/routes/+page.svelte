<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);

	const allDogs = ['philosopher','architect','intern','commander','rereader','caretaker','perfectionist','mentor','vampire','drifter','goldfish','helper','brute','ghost','speedrunner','googler'];
	let previewDogs = $state(allDogs.slice(0, 5));

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		const shuffled = [...allDogs].sort(() => Math.random() - 0.5);
		previewDogs = shuffled.slice(0, 5);
	});
</script>

<svelte:head>
	<title>{isZh ? 'PunkGo Roast — 你的 AI 是什么 Vibe？' : "PunkGo Roast — What's Your AI Vibe?"}</title>
	<meta property="og:title" content="What's Your AI Vibe?" />
	<meta property="og:description" content="Sixteen breeds. Which one is your AI? 🐾" />
</svelte:head>

<div class="landing">
	<section class="hero">
		<span class="section-tag">— A I &nbsp; V I B E &nbsp; C H E C K —</span>
		<h1>{isZh ? "你的 AI\n是什么 Vibe？" : "What's Your\nAI Vibe?"}</h1>
		<p class="subtitle">
			{isZh
				? '十六种狗子，你的 AI 是哪一只？'
				: 'Sixteen breeds. Which one is your AI?'}
		</p>
		<div class="dog-preview">
			{#each previewDogs as id}
				<img class="dog-dot" src="/dogs/felt-{id}-nobg.png" alt={id} width="72" height="72" loading="lazy" />
			{/each}
			<div class="dog-dot more">+11</div>
		</div>
		<a href="/quiz" class="cta-btn">
			{isZh ? '开始测试 🐾' : 'Start the Test 🐾'}
		</a>
		<p class="trust">{isZh ? '免费 · 无需注册 · 零数据收集' : 'Complimentary · No Registration · Zero Data Collected'}</p>
		<p class="methodology">
			{isZh
				? '基于投射性心理测试原理，通过 AI 对模糊情境的自然反应，解码其隐藏的行为人格。'
				: 'Built on projective psychological testing. We decode hidden behavioral personality through AI\'s natural response to ambiguous scenarios.'}
		</p>
		<!-- ext-inline hidden for v2, /install page kept -->
	</section>

	<footer class="footer">
		<a href="https://github.com/PunkGo/punkgo-roast-web" target="_blank" rel="noopener" class="github-link">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
			<span>{isZh ? '开源项目 · 一起建设' : 'Open Source · Build Together'}</span>
		</a>
	</footer>

</div>

<style>
	.landing { display: flex; flex-direction: column; }
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 56px);
		gap: 24px;
		padding: 0 48px;
		text-align: center;
	}
	.badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 18px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.badge-dot {
		width: 6px; height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-cta);
	}
	h1 {
		font-size: 60px;
		font-weight: 700;
		line-height: 1.05;
		white-space: pre-line;
		max-width: 700px;
	}
	.subtitle {
		font-size: 16px;
		color: var(--color-text-secondary);
		line-height: 1.6;
		white-space: pre-line;
		max-width: 560px;
	}
	.dog-preview { display: flex; gap: 14px; padding: 8px 0; }
	.dog-dot { width: 72px; height: 72px; border-radius: var(--radius-xl); object-fit: cover; }
	.dog-dot.more {
		background: var(--color-bg-muted);
		display: flex; align-items: center; justify-content: center;
		font-size: 14px; font-weight: 600; color: var(--color-text-secondary);
	}
	.cta-btn {
		display: inline-flex; align-items: center; justify-content: center;
		width: 240px; height: 52px;
		border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
		transition: background 150ms ease, transform 150ms ease;
	}
	.cta-btn:hover { background: var(--color-cta-hover); transform: translateY(-1px); }
	.trust {
		font-size: 14px; font-weight: 500;
		color: var(--color-text-secondary); letter-spacing: 0.05em;
	}
	.methodology {
		font-size: 11px;
		color: var(--color-text-tertiary);
		max-width: 600px;
		text-align: center;
		line-height: 1.6;
		font-style: italic;
		margin-top: 8px;
		white-space: nowrap;
	}
	@media (max-width: 639px) {
		.methodology { white-space: normal; max-width: 320px; }
	}
	.ext-inline {
		display: flex; align-items: center; gap: 6px;
		font-size: 13px; color: var(--color-text-tertiary);
		padding-top: 8px;
	}
	.ext-inline a {
		color: var(--color-cta); font-weight: 600;
		text-decoration: underline; text-underline-offset: 2px;
	}

	.footer {
		display: flex;
		justify-content: center;
		padding: 32px 0 48px;
	}
	.github-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--color-text-tertiary);
		transition: color 150ms ease;
	}
	.github-link:hover { color: var(--color-text-secondary); }

	@media (max-width: 639px) {
		h1 { font-size: 36px; }
		.hero { padding: 0 20px; }
		.section-tag { font-size: 8px; }
		.trust { text-align: center; padding: 0 16px; }
		.dog-preview { flex-wrap: wrap; justify-content: center; }
		.dog-dot { width: 48px; height: 48px; }
	}
</style>
