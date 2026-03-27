<script lang="ts">
	import { onMount } from 'svelte';
	import { dogs } from '$lib/data/dogs';
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const dogList = Object.values(dogs);
</script>

<svelte:head>
	<title>{isZh ? '十六狗子 — PunkGo Roast' : '16 Dogs — PunkGo Roast'}</title>
</svelte:head>

<div class="wall">
	<header>
		<span class="section-tag">— T H E &nbsp; C O L L E C T I O N —</span>
		<h1>{isZh ? '十六狗子。十六种 Vibe。' : 'Sixteen Dogs. Sixteen Vibes.'}</h1>
		<p>{isZh ? '每个 AI 都是其中之一。你的 AI 是哪只？' : 'Every AI is one of these. Which one is yours?'}</p>
	</header>
	<div class="grid">
		{#each dogList as dog}
			<div class="dog-card">
				<img class="dog-avatar" src="/dogs/felt-{dog.id}-nobg.png" alt={dog.name} width="44" height="44" loading="lazy" />
				<div class="dog-info">
					<span class="dog-name">{isZh ? dog.nameZh : dog.name}</span>
					<span class="dog-mbti" style="color:{dog.accentColor}">{dog.mbti}</span>
					<span class="dog-quip">{isZh ? dog.quipZh : dog.quip}</span>
				</div>
			</div>
		{/each}
	</div>
	<div class="wall-cta">
		<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
	</div>
</div>

<style>
	.wall { padding: 0 48px 64px; }
	header { text-align: center; padding: 32px 0 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
	header h1 { font-size: 32px; font-weight: 700; }
	header p { font-size: 15px; color: var(--color-text-secondary); }
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.dog-card {
		border-radius: var(--radius-lg);
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 100px;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
	}
	.dog-avatar { width: 44px; height: 44px; border-radius: var(--radius-full); flex-shrink: 0; object-fit: cover; }
	.dog-info { display: flex; flex-direction: column; gap: 2px; }
	.dog-name { font-size: 14px; font-weight: 700; color: #3A2518; }
	.dog-mbti { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; }
	.dog-quip { font-size: 11px; color: #8B7060; }
	.wall-cta { text-align: center; padding-top: 32px; }
	.cta-btn {
		display: inline-flex; align-items: center; justify-content: center;
		padding: 12px 32px;
		border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
	}

	@media (max-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
	@media (max-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } .wall { padding: 0 16px 48px; } }
</style>
