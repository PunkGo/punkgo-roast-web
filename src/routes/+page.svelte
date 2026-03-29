<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);

	const allDogs = ['philosopher','architect','intern','commander','rereader','caretaker','perfectionist','mentor','vampire','drifter','goldfish','helper','brute','ghost','speedrunner','googler'];
	let previewDogs = $state(allDogs.slice(0, 5));
	let myKennels: { id: string; dogId: string }[] = $state([]);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		const shuffled = [...allDogs].sort(() => Math.random() - 0.5);
		previewDogs = shuffled.slice(0, 5);

		// Parse punkgo_k_{id}={dogId} cookies
		const cookies = document.cookie.split(';').map(c => c.trim());
		const kennels: { id: string; dogId: string }[] = [];
		for (const c of cookies) {
			const m = c.match(/^punkgo_k_([a-z0-9]{8})=(.+)$/);
			if (m && m[2] !== '') {
				const dogId = m[2];
				// Skip legacy cookies with value '1' (no dog info)
				if (dogId !== '1' && allDogs.includes(dogId)) {
					kennels.push({ id: m[1], dogId });
				} else {
					// Legacy cookie — show generic paw instead of broken image
					kennels.push({ id: m[1], dogId: '' });
				}
			}
		}
		myKennels = kennels;
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
				<img class="dog-dot" src="/dogs/thumb/felt-{id}-nobg.png" alt={id} width="72" height="72" loading="lazy" />
			{/each}
			<div class="dog-dot more">+11</div>
		</div>
		<a href="/quiz" class="cta-btn">
			{isZh ? '来，测一个 🐾' : 'Let\'s Find Out 🐾'}
		</a>
		<p class="trust">{isZh ? '免费 · 无需注册 · 零数据收集' : 'Complimentary · No Registration · Zero Data Collected'}</p>
		{#if myKennels.length > 0}
			<div class="my-kennels">
				<p class="my-kennels-label">{isZh ? '🏠 我的狗窝' : '🏠 My Kennels'}</p>
				<div class="kennel-links">
					{#each myKennels as k}
						<a href="/k/{k.id}/web" class="kennel-chip" title={k.dogId || k.id}>
							{#if k.dogId}
								<img src="/dogs/thumb/felt-{k.dogId}-nobg.png" alt={k.dogId} class="kennel-chip-img" />
							{:else}
								<span class="kennel-chip-paw">🐾</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
		<p class="methodology">
			{isZh
				? '基于投射性心理测试原理，通过 AI 对模糊情境的自然反应，解码其隐藏的行为人格。'
				: 'Built on projective psychological testing. We decode hidden behavioral personality through AI\'s natural response to ambiguous scenarios.'}
		</p>
		<!-- ext-inline hidden for v2, /install page kept -->
	</section>


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
		font-size: var(--font-size-hero);
		font-weight: 700;
		line-height: 1.05;
		white-space: pre-line;
		max-width: 700px;
	}
	.subtitle {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		line-height: 1.6;
		white-space: pre-line;
		max-width: 560px;
	}
	.dog-preview { display: flex; gap: 14px; padding: var(--space-sm) 0; }
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
		font-size: var(--font-size-md); font-weight: 700; letter-spacing: 0.05em;
		transition: background 150ms ease, transform 150ms ease;
	}
	.cta-btn:hover { background: var(--color-cta-hover); transform: translateY(-1px); }
	.trust {
		font-size: 14px; font-weight: 500;
		color: var(--color-text-secondary); letter-spacing: 0.05em;
	}
	.methodology {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		max-width: 600px;
		text-align: center;
		line-height: 1.6;
		font-style: italic;
		margin-top: 8px;
		white-space: nowrap;
	}
	@media (max-width: 768px) {
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

	/* My kennels */
	.my-kennels {
		display: flex; flex-direction: column; align-items: center; gap: 8px;
	}
	.my-kennels-label {
		font-size: 13px; color: var(--color-text-secondary); font-weight: 500;
	}
	.kennel-links { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 320px; }
	.kennel-chip {
		width: 52px; height: 52px; border-radius: var(--radius-full);
		background: var(--color-bg-muted); border: 2px solid var(--color-border);
		display: flex; align-items: center; justify-content: center;
		overflow: hidden; transition: transform 150ms ease, border-color 150ms ease;
	}
	.kennel-chip:hover { border-color: var(--color-cta); transform: translateY(-2px); }
	.kennel-chip-img { width: 40px; height: 40px; object-fit: contain; }
	.kennel-chip-paw { font-size: 24px; }

	@media (max-width: 768px) {
		h1 { font-size: 36px; }
		.hero { padding: 0 20px; }
		.section-tag { font-size: 8px; }
		.trust { text-align: center; padding: 0 16px; }
		.dog-preview { flex-wrap: wrap; justify-content: center; }
		.dog-dot { width: 48px; height: 48px; }
	}
</style>
