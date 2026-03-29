<script lang="ts">
	import type { Dog } from '$lib/data/dogs';

	interface Props {
		dog: Dog;
		locale?: string;
		aiName?: string;
		customQuip?: string | null;
		customIntro?: string | null;
	}

	let { dog, locale = 'en', aiName = 'AI', customQuip = null, customIntro = null }: Props = $props();
	let cardRef: HTMLElement | null = $state(null);
	let savePreviewUrl: string | null = $state(null);

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
		// Clone to offscreen — avoids 3D transform + cross-origin CSS issues
		const wrapper = document.createElement('div');
		wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
		const clone = cardRef.cloneNode(true) as HTMLElement;
		clone.className = '';
		clone.style.cssText = `
			width: ${cardRef.offsetWidth}px;
			min-height: ${cardRef.offsetHeight}px;
			background: #F5F0E8;
			border: 1.5px solid #D4C9B8;
			border-radius: 20px;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			box-shadow: 0 4px 24px rgba(0,0,0,0.08);
		`;
		wrapper.appendChild(clone);
		document.body.appendChild(wrapper);

		const { toPng } = await import('html-to-image');
		const url = await toPng(clone, { pixelRatio: 2 });
		document.body.removeChild(wrapper);

		const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
		if (isMobile) {
			savePreviewUrl = url;
		} else {
			const link = document.createElement('a');
			link.download = `punkgo-quiz-${dog.id}.png`;
			link.href = url;
			link.click();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card-shell card-holo" bind:this={cardRef} onmousemove={handleTilt} onmouseleave={handleTiltReset}>
	<div class="card-glow"></div>
	<div class="qc-img-wrap">
		<p class="card-ai-label">{isZh ? `这只 ${aiName} 是` : `This ${aiName} is`}</p>
		<img src="/dogs/felt-{dog.id}-nobg.png" alt={isZh ? dog.nameZh : dog.name} class="qc-img" />
		<span class="card-breed">{dog.breed}</span>
	</div>
	<div class="card-body">
		<span class="card-name">{dog.mbti}<span class="card-name-sep">·</span>{isZh ? dog.nameZh : dog.name}</span>
		<p class="card-roast-intro">{customIntro || (isZh ? '别人看它:' : 'What others see:')}</p>
		<p class="card-quip">"{customQuip || (isZh ? dog.quipZh : dog.quip)}"</p>
	</div>
	<span class="card-water">roast.punkgo.ai</span>
</div>

{#if savePreviewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="save-overlay" onclick={() => savePreviewUrl = null}>
		<p class="save-hint">{isZh ? '长按图片保存 · 点击任意处关闭' : 'Long-press to save · Tap to close'}</p>
		<img src={savePreviewUrl} alt="card" class="save-preview-img" />
	</div>
{/if}

<style>
	.save-overlay {
		position: fixed; inset: 0; z-index: 9999;
		background: rgba(0,0,0,0.8);
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 16px; padding: 20px;
	}
	.save-hint { color: white; font-size: 14px; text-align: center; }
	.save-preview-img { max-width: 90vw; max-height: 80vh; border-radius: 12px; }
	.card-shell {
		width: min(340px, 80vw); min-height: 400px;
		background: #F5F0E8;
		border: 1.5px solid #D4C9B8;
		border-radius: 20px;
		overflow: hidden;
		-webkit-mask-image: -webkit-radial-gradient(white, black); /* force clip on iOS/WeChat */
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
		gap: 0; padding: 6px 14px 16px;
	}
	.card-ai-label {
		position: absolute; top: 10px; left: 12px;
		font-size: 10px;
		font-weight: 500;
		color: #6B5545;
		letter-spacing: 0.05em;
		margin: 0;
		background: rgba(245, 240, 232, 0.85);
		padding: 2px 8px; border-radius: 8px;
		z-index: 1;
	}
	.card-name {
		font-size: 17px; font-weight: 700; color: #3A2518;
		display: flex; align-items: baseline; gap: 0;
		white-space: nowrap;
		margin-bottom: 2px;
	}
	.card-name-sep {
		margin: 0 5px; font-weight: 400; color: #6B5545; font-size: 13px;
	}
	.card-breed {
		position: absolute; bottom: 8px; right: 12px;
		font-size: 10px; font-weight: 500; color: #6B5545;
		background: rgba(245, 240, 232, 0.85);
		padding: 2px 8px; border-radius: 8px;
		letter-spacing: 0.5px;
	}
	.card-roast-intro {
		font-size: 10px; color: #8B7B6B; margin: 0;
		letter-spacing: 0.03em;
	}
	.card-quip {
		font-size: 12px; font-weight: 600; font-style: italic;
		color: #3A2518; text-align: center; line-height: 1.4;
		padding: 0 6px; margin: 0;
		display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
		overflow: hidden;
	}
	.card-water {
		position: absolute; bottom: 5px; right: 10px;
		font-size: 8px; color: #8B7B6B;
	}
	.qc-img-wrap {
		width: 100%; flex: 1;
		overflow: hidden;
		display: flex; align-items: center; justify-content: center;
		background: linear-gradient(135deg, #EDE5D8 0%, #F5F0E8 50%, #E8E0D4 100%);
		border-radius: 20px 20px 0 0;
		position: relative;
	}
	.qc-img { max-width: 85%; max-height: 90%; object-fit: contain; display: block; }
	@media (max-width: 639px) {
		.card-shell { width: min(280px, 75vw); min-height: 360px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.card-holo { transition: none; }
	}
</style>
