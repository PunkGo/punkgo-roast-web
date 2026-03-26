<script lang="ts">
	import type { Dog } from '$lib/data/dogs';
	import { RADAR_LABELS, type RadarData } from '$lib/card/radar';

	const RADAR_LABELS_ZH = ['嘴替', '抄作业', '肝帝', '使命必达', '上头', '活人感'] as const;
	const ANGLES = [-90, -30, 30, 90, 150, 210];
	const CX = 160;
	const CY = 160;
	const R = 105;

	interface Props {
		dog: Dog;
		locale?: string;
		radarData: RadarData;
		quip: string;
		catchphrase: string;
	}

	let { dog, locale = 'en', radarData, quip, catchphrase }: Props = $props();
	let cardRef: HTMLElement | null = $state(null);

	function radarPoints(data: RadarData): string {
		return data.map((v, i) => {
			const rad = (ANGLES[i] * Math.PI) / 180;
			const x = CX + (v / 100) * R * Math.cos(rad);
			const y = CY + (v / 100) * R * Math.sin(rad);
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		}).join(' ');
	}

	function gridHex(scale: number): string {
		const r = R * scale;
		return ANGLES.map(a => {
			const rad = (a * Math.PI) / 180;
			return `${(CX + r * Math.cos(rad)).toFixed(1)},${(CY + r * Math.sin(rad)).toFixed(1)}`;
		}).join(' ');
	}

	function labelPos(i: number): { x: number; y: number; anchor: string } {
		const rad = (ANGLES[i] * Math.PI) / 180;
		const x = CX + (R + 20) * Math.cos(rad);
		const y = CY + (R + 20) * Math.sin(rad);
		const anchor = x < CX - 5 ? 'end' : x > CX + 5 ? 'start' : 'middle';
		return { x, y: y + (y < CY - 5 ? -4 : y > CY + 5 ? 12 : 4), anchor };
	}

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

	export async function saveAsPng() {
		if (!cardRef) return;
		const { toPng } = await import('html-to-image');
		const url = await toPng(cardRef, { pixelRatio: 2 });
		const link = document.createElement('a');
		link.download = `punkgo-ext-${dog.id}.png`;
		link.href = url;
		link.click();
	}

	const isZh = $derived(locale.startsWith('zh'));
	const labels = $derived(isZh ? RADAR_LABELS_ZH : RADAR_LABELS);
	const labelFont = $derived(isZh ? 'Noto Sans SC, Space Grotesk, sans-serif' : 'Space Grotesk, sans-serif');
	const displayName = $derived(isZh ? dog.nameZh : dog.name);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card-shell card-holo"
	bind:this={cardRef}
	style="--accent:{dog.accentColor}"
	onmousemove={handleTilt}
	onmouseleave={handleTiltReset}
>
	<div class="card-glow"></div>
	<div class="ec-hero">
		<img src="/dogs/felt-{dog.id}-nobg.png" alt="" class="ec-ghost-img" />
		<div class="ec-hero-overlay">
			<span class="ec-name">{displayName}</span>
			<span class="ec-mbti">{dog.mbti}</span>
		</div>
	</div>
	<div class="card-body ec-body">
		<div class="ec-radar-wrap">
			<svg viewBox="-50 -20 420 370" class="ec-radar-svg">
				{#each [1, 0.66, 0.33] as scale}
					<polygon points={gridHex(scale)} fill="none" stroke="var(--accent)" opacity="0.25" stroke-width="1"/>
				{/each}
				{#each [0,1,2,3,4,5] as i}
					{@const rad = (ANGLES[i] * Math.PI) / 180}
					<line x1={CX} y1={CY} x2={CX + R * Math.cos(rad)} y2={CY + R * Math.sin(rad)} stroke="var(--accent)" opacity="0.12" stroke-width="0.5"/>
				{/each}
				<polygon
					points={radarPoints(radarData)}
					fill="var(--accent)" fill-opacity="0.18"
					stroke="var(--accent)"
					stroke-width="2"
					stroke-linejoin="round"
				/>
				{#each radarData as v, i}
					{@const rad = (ANGLES[i] * Math.PI) / 180}
					<circle cx={CX + (v/100)*R*Math.cos(rad)} cy={CY + (v/100)*R*Math.sin(rad)} r="4" fill="var(--accent)" />
					<text x={CX + (v/100)*R*Math.cos(rad)} y={CY + (v/100)*R*Math.sin(rad) - 8} text-anchor="middle" fill="var(--accent)" font-size="10" font-weight="700" font-family="Space Grotesk">{v}</text>
				{/each}
				{#each labels as label, i}
					{@const lp = labelPos(i)}
					<text x={lp.x} y={lp.y} text-anchor={lp.anchor} fill="#3A2518" font-size="11" font-weight="600" font-family={labelFont}>{label}</text>
				{/each}
			</svg>
		</div>
		<p class="card-quip ec-quip">"{quip}"</p>
		<div class="ec-catch">— {catchphrase}</div>
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
	.card-quip {
		font-size: 13px; font-weight: 600; font-style: italic;
		color: #3A2518; text-align: center; line-height: 1.5;
		padding: 0 8px; margin: 0;
	}
	.card-water { font-size: 9px; color: #8B7B6B; padding-top: 6px; }

	.ec-hero {
		width: 100%; height: 90px; position: relative;
		overflow: hidden; display: flex; align-items: flex-end;
		background: linear-gradient(135deg, #EDE5D8 0%, #F5F0E8 100%);
	}
	.ec-ghost-img {
		position: absolute; top: -20px; right: -10px;
		width: 110px; height: 110px; object-fit: contain;
		opacity: 0.25;
	}
	.ec-hero-overlay {
		position: relative; z-index: 1;
		padding: 12px 20px;
		display: flex; flex-direction: column; gap: 0;
	}
	.ec-name { font-size: 22px; font-weight: 700; color: #3A2518; }
	.ec-mbti {
		font-size: 12px; font-weight: 700; letter-spacing: 3px;
		color: var(--accent, #5A8C6A);
	}
	.ec-body { gap: 4px; padding: 4px 12px 10px; }
	.ec-radar-wrap { width: 100%; display: flex; justify-content: center; }
	.ec-radar-svg { width: 100%; max-width: 280px; height: auto; }
	.ec-quip { font-size: 14px; padding: 4px 12px 0; }
	.ec-catch {
		font-size: 11px; color: var(--accent, #5A8C6A);
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		.card-holo { transition: none; }
	}
</style>
