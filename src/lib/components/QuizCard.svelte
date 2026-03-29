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
		const wrapper = document.createElement('div');
		wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
		const clone = cardRef.cloneNode(true) as HTMLElement;
		clone.className = '';
		const w = cardRef.offsetWidth;
		clone.style.cssText = `
			width:${w}px; min-height:${cardRef.offsetHeight}px;
			background:linear-gradient(170deg,#F8F2E8 0%,#EDE0C8 100%);
			border-radius:20px; overflow:hidden; display:flex; flex-direction:column;
			box-shadow:0 8px 32px rgba(40,24,12,0.18); border:1.5px solid #D4C9B8;
			position:relative;
		`;
		// Force inline styles on clone children (Svelte scoped CSS lost on clone)
		const s: Record<string, string> = {
			'tag-l': 'position:absolute;top:12px;left:14px;font-size:8px;font-weight:400;color:#A0907E;z-index:3;',
			'tag-r': 'position:absolute;top:12px;right:14px;font-size:9px;font-weight:500;color:#7A6650;background:rgba(255,255,255,0.72);padding:3px 10px;border-radius:10px;z-index:3;',
			'thought': 'padding:32px 20px 0;display:flex;justify-content:center;',
			'cloud': 'background:#fff;border-radius:20px;padding:14px 18px;font-size:13px;font-weight:600;font-style:italic;color:#2A1810;line-height:1.55;box-shadow:0 2px 12px rgba(40,24,12,0.06);text-align:center;position:relative;max-width:94%;',
			'cloud-label': 'font-size:9px;font-weight:500;color:#A0907E;font-style:normal;display:block;margin-bottom:4px;letter-spacing:0.06em;',
			'dot1': `width:11px;height:11px;background:#fff;border-radius:50%;position:absolute;bottom:-9px;left:50%;margin-left:8px;box-shadow:0 1px 4px rgba(40,24,12,0.06);`,
			'dot2': `width:6px;height:6px;background:#fff;border-radius:50%;position:absolute;bottom:-16px;left:50%;margin-left:14px;box-shadow:0 1px 3px rgba(40,24,12,0.04);`,
			'dog-area': 'flex:1;display:flex;align-items:flex-end;justify-content:center;padding:0 0 4px;',
			'card-info': 'background:#F5F0E8;padding:14px 20px 20px;display:flex;flex-direction:column;align-items:center;gap:1px;',
			'ai-intro': 'font-size:10px;font-weight:500;color:#A0907E;letter-spacing:0.1em;margin:0;line-height:1.3;',
			'name-row': 'display:flex;align-items:baseline;gap:10px;justify-content:center;margin:0;line-height:1;',
			'info-mbti': 'font-size:13px;font-weight:800;color:#C08040;letter-spacing:0.18em;',
			'info-name': 'font-size:22px;font-weight:900;color:#2A1810;line-height:1.2;',
			'info-traits': 'font-size:11px;font-weight:400;color:#A0907E;text-align:center;letter-spacing:0.06em;margin-top:2px;white-space:nowrap;',
		};
		for (const [cls, style] of Object.entries(s)) {
			clone.querySelectorAll(`.${cls}`).forEach((el) => {
				(el as HTMLElement).style.cssText += style;
			});
		}
		// Dog image
		const dogImg = clone.querySelector('.dog-area img') as HTMLElement;
		if (dogImg) dogImg.style.cssText = 'width:52%;object-fit:contain;display:block;';
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
	<!-- Brand + Breed tags -->
	<span class="tag-l">roast.punkgo.ai</span>
	<span class="tag-r">{isZh ? dog.breedZh : dog.breed}</span>
	<!-- Thought bubble -->
	<div class="thought">
		<div class="cloud">
			<span class="cloud-label">{customIntro || (isZh ? '它这样介绍你' : 'About its owner')}</span>
			"{customQuip || (isZh ? dog.quipZh : dog.quip)}"
			<div class="dot1"></div>
			<div class="dot2"></div>
		</div>
	</div>
	<!-- Dog -->
	<div class="dog-area">
		<img src="/dogs/felt-{dog.id}-chat.png" alt={isZh ? dog.nameZh : dog.name} />
	</div>
	<!-- Info bar -->
	<div class="card-info">
		<span class="ai-intro">{isZh ? `这只 ${aiName} 是` : `This ${aiName} is`}</span>
		<div class="name-row">
			<span class="info-mbti">{dog.mbti}</span>
			<span class="info-name">{isZh ? dog.nameZh : dog.name}</span>
		</div>
		<span class="info-traits">{isZh ? dog.traitsZh || '' : dog.traits || ''}</span>
	</div>
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

	/* Card shell */
	.card-shell {
		width: min(300px, 80vw);
		height: 420px;
		border-radius: 20px;
		overflow: hidden;
		-webkit-mask-image: -webkit-radial-gradient(white, black);
		display: flex; flex-direction: column;
		box-shadow: 0 8px 32px rgba(40, 24, 12, 0.18);
		border: 1.5px solid #D4C9B8;
		position: relative;
		background: linear-gradient(170deg, #F8F2E8 0%, #EDE0C8 100%);
	}
	.card-holo {
		transition: transform 200ms ease, box-shadow 200ms ease;
		will-change: transform;
	}
	.card-holo:hover {
		box-shadow: 0 12px 48px rgba(40, 24, 12, 0.22), 0 0 20px rgba(90,140,106,0.08);
	}
	.card-glow {
		position: absolute; inset: 0; z-index: 10;
		border-radius: 20px; pointer-events: none;
		background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%);
		mix-blend-mode: overlay;
		opacity: 0; transition: opacity 200ms ease;
	}
	.card-holo:hover .card-glow { opacity: 1; }

	/* Tags */
	.tag-l {
		position: absolute; top: 12px; left: 14px;
		font-size: 8px; font-weight: 400; color: #A0907E;
		z-index: 3; letter-spacing: 0.04em;
	}
	.tag-r {
		position: absolute; top: 12px; right: 14px;
		font-size: 9px; font-weight: 500; color: #7A6650;
		background: rgba(255,255,255,0.72);
		padding: 3px 10px; border-radius: 10px;
		backdrop-filter: blur(6px); z-index: 3;
	}

	/* Thought cloud */
	.thought {
		padding: 32px 20px 0;
		display: flex; justify-content: center;
	}
	.cloud {
		background: #fff;
		border-radius: 20px;
		padding: 14px 18px;
		font-size: 13px; font-weight: 600; font-style: italic;
		color: #2A1810; line-height: 1.55;
		box-shadow: 0 2px 12px rgba(40, 24, 12, 0.06);
		text-align: center;
		position: relative;
		max-width: 94%;
	}
	.cloud-label {
		font-size: 9px; font-weight: 500; color: #A0907E; font-style: normal;
		display: block; margin-bottom: 4px;
		letter-spacing: 0.06em;
	}
	.dot1 {
		width: 11px; height: 11px; background: #fff; border-radius: 50%;
		position: absolute; bottom: -9px; left: 50%; margin-left: 8px;
		box-shadow: 0 1px 4px rgba(40, 24, 12, 0.06);
	}
	.dot2 {
		width: 6px; height: 6px; background: #fff; border-radius: 50%;
		position: absolute; bottom: -16px; left: 50%; margin-left: 14px;
		box-shadow: 0 1px 3px rgba(40, 24, 12, 0.04);
	}

	/* Dog area */
	.dog-area {
		flex: 1; display: flex; align-items: flex-end; justify-content: center;
		padding: 0 0 4px;
	}
	.dog-area img {
		width: 52%; object-fit: contain;
		filter: drop-shadow(0 6px 16px rgba(40, 24, 12, 0.12));
	}

	/* Info bar */
	.card-info {
		background: #F5F0E8;
		padding: 14px 20px 20px;
		display: flex; flex-direction: column; align-items: center;
		gap: 1px;
	}
	.ai-intro {
		font-size: 10px; font-weight: 500; color: #A0907E;
		letter-spacing: 0.1em;
		margin: 0; line-height: 1.3;
	}
	.name-row {
		display: flex; align-items: baseline; gap: 10px; justify-content: center;
		margin: 0; line-height: 1;
	}
	.info-mbti {
		font-size: 13px; font-weight: 800; color: #C08040;
		letter-spacing: 0.18em;
	}
	.info-name {
		font-size: 22px; font-weight: 900; color: #2A1810; line-height: 1.2;
	}
	.info-traits {
		font-size: 11px; font-weight: 400; color: #A0907E;
		text-align: center; letter-spacing: 0.06em; margin-top: 2px;
		white-space: nowrap;
	}

	@media (max-width: 639px) {
		.card-shell { width: min(280px, 75vw); height: 390px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.card-holo { transition: none; }
	}
</style>
