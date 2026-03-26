<script lang="ts">
	import type { Dog } from '$lib/data/dogs';

	interface Props {
		dog: Dog;
		locale?: string;
	}

	let { dog, locale = 'en' }: Props = $props();
	let cardRef: HTMLElement | null = $state(null);

	$effect(() => { void dog; void locale; });

	const isZh = $derived(locale === 'zh');

	function handleTilt(e: MouseEvent) {
		const card = e.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		const rotateX = (y - 0.5) * -15;
		const rotateY = (x - 0.5) * 15;
		card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
		card.style.setProperty('--glow-x', `${x * 100}%`);
		card.style.setProperty('--glow-y', `${y * 100}%`);
	}

	function handleTiltReset(e: MouseEvent) {
		const card = e.currentTarget as HTMLElement;
		card.style.transform = '';
	}

	export async function saveAsPng(): Promise<void> {
		if (!cardRef) return;
		const { toPng } = await import('html-to-image');
		const url = await toPng(cardRef, { pixelRatio: 2 });
		const link = document.createElement('a');
		link.download = `punkgo-quiz-${dog.id}.png`;
		link.href = url;
		link.click();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card-shell card-holo" bind:this={cardRef} onmousemove={handleTilt} onmouseleave={handleTiltReset}>
	<div class="card-glow"></div>
	<div class="qc-img-wrap">
		<img src="/dogs/felt-{dog.id}-nobg.png" alt={isZh ? dog.nameZh : dog.name} class="qc-img" />
	</div>
	<div class="card-body">
		<span class="card-name">{isZh ? dog.nameZh : dog.name}</span>
		<span class="card-meta">{dog.mbti} · {dog.breed}</span>
		<p class="card-quip">"{isZh ? dog.quipZh : dog.quip}"</p>
		<span class="card-water">roast.punkgo.ai</span>
	</div>
</div>

<style>
	.card-shell {
		width: 340px; height: 453px;
		background: #F5F0E8;
		border-radius: 20px;
		overflow: hidden;
		display: flex; flex-direction: column;
		box-shadow: 0 4px 24px rgba(0,0,0,0.08);
		position: relative;
	}
	.card-holo {
		transition: transform 200ms ease, box-shadow 200ms ease;
		will-change: transform;
	}
	.card-holo:hover {
		box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 0 20px rgba(90,140,106,0.1);
	}
	.card-glow {
		position: absolute; inset: 0; z-index: 10;
		border-radius: 20px; pointer-events: none;
		background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%);
		mix-blend-mode: overlay;
		opacity: 0; transition: opacity 200ms ease;
	}
	.card-holo:hover .card-glow { opacity: 1; }
	.card-body {
		display: flex; flex-direction: column; align-items: center;
		gap: 3px; padding: 12px 16px 10px;
	}
	.card-name { font-size: 22px; font-weight: 700; color: #3A2518; }
	.card-meta { font-size: 11px; color: #6B5545; letter-spacing: 0.5px; }
	.card-quip {
		font-size: 13px; font-weight: 600; font-style: italic;
		color: #3A2518; text-align: center; line-height: 1.5;
		padding: 0 8px; margin: 0;
	}
	.card-water { font-size: 9px; color: #8B7B6B; padding-top: 6px; }
	.qc-img-wrap {
		width: 100%; flex: 1;
		overflow: hidden;
		display: flex; align-items: center; justify-content: center;
		background: linear-gradient(135deg, #EDE5D8 0%, #F5F0E8 50%, #E8E0D4 100%);
	}
	.qc-img { max-width: 85%; max-height: 90%; object-fit: contain; display: block; }
	@media (prefers-reduced-motion: reduce) {
		.card-holo { transition: none; }
	}
</style>
