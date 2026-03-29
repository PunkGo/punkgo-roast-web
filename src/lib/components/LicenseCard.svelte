<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dog } from '$lib/data/dogs';
	import { generateQRDataURL } from '$lib/utils/qrcode';

	interface Props {
		dog: Dog;
		kennelId: string;
		recoveryCode: string; // empty = visitor/share mode, no recovery code shown
		aiName: string;
		customQuip?: string | null;
		customIntro?: string | null;
		issuedDate: string;
		isFirstTime: boolean;
		locale: string;
		onclose: () => void;
	}

	let {
		dog,
		kennelId,
		recoveryCode,
		aiName,
		customQuip = null,
		customIntro = null,
		issuedDate,
		isFirstTime,
		locale,
		onclose,
	}: Props = $props();

	const isZh = $derived(locale === 'zh');

	let phase: 'loading' | 'ready' | 'flipped' = $state('loading');
	let showCode: boolean = $state(isFirstTime);
	let qrDataURL: string = $state('');
	let cardRef: HTMLElement | null = $state(null);
	let savePreviewUrl: string = $state('');
	const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

	const maskedCode = '****-****-****';
	const displayCode = $derived(showCode ? recoveryCode : maskedCode);

	const formattedDate = $derived(() => {
		try {
			const d = new Date(issuedDate);
			return d.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch {
			return issuedDate;
		}
	});

	const warningText = $derived(
		isZh
			? '恢复码是找回狗窝的唯一凭证，请勿外泄'
			: 'Recovery code is the only way to restore your kennel. Keep it safe.',
	);

	function toggleCode() {
		showCode = !showCode;
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	export async function saveAsPng(): Promise<void> {
		if (!cardRef) return;
		// Create a clean wrapper — no 3D classes, no transforms, no backface issues
		const wrapper = document.createElement('div');
		wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
		const clone = cardRef.cloneNode(true) as HTMLElement;
		clone.className = '';
		clone.style.cssText = `
			width: ${cardRef.offsetWidth}px;
			min-height: ${cardRef.offsetHeight}px;
			background: #FAFAF5;
			border: 3px solid ${dog.cardColor || '#D4B896'};
			border-radius: 20px;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			padding: 20px 22px 16px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			position: relative;
		`;
		// Force inline styles on clone children to avoid CSS variable / scoped style loss
		const inlineStyles: Record<string, string> = {
			'card-header': 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0;',
			'header-brand': 'font-size:13px;font-weight:700;color:#3A2518;letter-spacing:0.15em;',
			'header-type': 'font-size:10px;color:#6B5545;letter-spacing:0.1em;font-weight:500;',
			'header-divider': 'height:1.5px;background:linear-gradient(90deg,transparent,#D4B896,transparent);margin:8px 0;',
			'dog-info-center': 'display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;',
			'dog-card-name': 'font-size:20px;font-weight:700;color:#3A2518;text-align:center;margin:4px 0 0;line-height:1.2;',
			'dog-card-meta': 'font-size:12px;color:#6B5545;text-align:center;margin:0;letter-spacing:0.05em;',
			'dog-card-roast-intro': 'font-size:9px;color:#8B7B6B;text-align:center;margin:0;',
			'dog-card-quip': 'font-size:11px;font-weight:600;font-style:italic;color:#3A2518;text-align:center;line-height:1.4;margin:1px 0 0;padding:0 8px;',
			'card-bottom': 'display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:8px;',
			'card-footer': 'display:flex;justify-content:space-between;font-size:8px;color:#8B7B6B;margin-top:6px;',
		};
		for (const [cls, style] of Object.entries(inlineStyles)) {
			const el = clone.querySelector(`.${cls}`) as HTMLElement;
			if (el) el.style.cssText += style;
		}
		wrapper.appendChild(clone);
		document.body.appendChild(wrapper);

		const { toPng } = await import('html-to-image');
		const dataUrl = await toPng(clone, { pixelRatio: 2 });

		document.body.removeChild(wrapper);

		if (isMobile) {
			// Mobile: show image for long-press save (download doesn't work in WeChat/Douyin WebView)
			savePreviewUrl = dataUrl;
		} else {
			// Desktop: trigger download
			const link = document.createElement('a');
			link.download = `punkgo-dog-card-${kennelId}.png`;
			link.href = dataUrl;
			link.click();
		}
	}

	onMount(() => {
		const qrPromise = generateQRDataURL(`https://roast.punkgo.ai/k/${kennelId}`);

		const imgPromise = new Promise<void>((resolve) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = `/dogs/felt-${dog.id}-nobg.png`;
		});

		Promise.all([qrPromise, imgPromise]).then(([qr]) => {
			qrDataURL = qr;
			phase = 'ready';
			setTimeout(() => {
				phase = 'flipped';
			}, 100);
		});
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="overlay" onclick={handleOverlayClick}>
	{#if phase === 'loading'}
		<div class="loading-container">
			<span class="loading-paw">&#128062;</span>
		</div>
	{:else}
		<div class="modal-content">
			<div class="flip-container">
				<div class="flip-inner" class:flipped={phase === 'flipped'}>
					<!-- Card Back -->
					<div class="card-face card-back" style="--card-color: {dog.cardColor}">
						<div class="back-pattern">
							<div class="back-paws">
								{#each Array(20) as _}
									<span class="paw-dot">&#128062;</span>
								{/each}
							</div>
						</div>
						<div class="back-center">
							<span class="back-paw-main">&#128062;</span>
							<span class="back-title">{isZh ? '胖狗' : 'PUNKGO ROAST'}</span>
							<span class="back-subtitle">AI DOG CARD</span>
						</div>
					</div>

					<!-- Card Front -->
					<div class="card-face card-front" bind:this={cardRef} style="--card-color: {dog.cardColor}">
						<!-- Header -->
						<div class="card-header">
							<span class="header-brand">{isZh ? '胖狗' : 'PUNKGO ROAST'}</span>
							<span class="header-type">{isZh ? `这只 ${aiName} 是` : `This ${aiName} is`}</span>
						</div>
						<div class="header-divider"></div>

						<!-- Dog Info — centered -->
						<div class="dog-info-center">
							<div class="dog-avatar-large">
								<img
									src="/dogs/felt-{dog.id}-nobg.png"
									alt={isZh ? dog.nameZh : dog.name}
									class="dog-img-large"
								/>
							</div>
							<h2 class="dog-card-name">{isZh ? dog.nameZh : dog.name}</h2>
							<p class="dog-card-meta">{dog.mbti} &middot; {isZh ? dog.breedZh : dog.breed}</p>
							<p class="dog-card-roast-intro">{customIntro || (isZh ? '别人看它:' : 'What others see:')}</p>
							<p class="dog-card-quip">"{customQuip || (isZh ? dog.quipZh : dog.quip)}"</p>
						</div>

						<!-- QR + Recovery Code -->
						<div class="card-bottom">
							<div class="bottom-left">
								{#if qrDataURL}
									<img src={qrDataURL} alt="QR" class="qr-small" />
								{/if}
							</div>
							<div class="bottom-right">
								{#if recoveryCode}
									<div class="code-row">
										<span class="code-text">{displayCode}</span>
									</div>
								{/if}
								<span class="kennel-id">k/{kennelId}</span>
							</div>
						</div>

						<!-- Footer -->
						<div class="card-footer">
							<span>{formattedDate()}</span>
							<span>https://roast.punkgo.ai/k/{kennelId}/web</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Actions (fade in after flip) -->
			{#if phase === 'flipped'}
				{#if isFirstTime && recoveryCode}
					<p class="first-time-hint">
						⚠️ {isZh ? '这张狗卡是你进入狗窝的唯一凭证，请下载保存或截图！' : 'This dog card is your only key to the kennel. Download or screenshot it!'}
					</p>
				{/if}
				<div class="actions">
					<button class="action-btn save-btn" onclick={saveAsPng}>
						&#128248; {isZh ? '保存狗卡' : 'Save Dog Card'}
					</button>
					<button class="action-btn close-btn" onclick={onclose}>
						{isFirstTime ? (isZh ? '🏠 进入狗窝' : '🏠 Enter Kennel') : (isZh ? '✕ 关闭' : '✕ Close')}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Mobile save preview: long-press to save -->
{#if savePreviewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="save-preview-overlay" onclick={() => { savePreviewUrl = ''; }}>
		<div class="save-preview-content" onclick={(e) => e.stopPropagation()}>
			<p class="save-hint">{isZh ? '长按图片保存到相册' : 'Long press the image to save'}</p>
			<img src={savePreviewUrl} alt="Dog Card" class="save-preview-img" />
			<button class="save-preview-close" onclick={() => { savePreviewUrl = ''; }}>
				{isZh ? '✕ 关闭' : '✕ Close'}
			</button>
		</div>
	</div>
{/if}

<style>
	/* Overlay */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		backdrop-filter: blur(6px);
	}

	/* Loading */
	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-paw {
		font-size: 60px;
		animation: gentle-pulse 2s ease-in-out infinite;
	}

	@keyframes gentle-pulse {
		0%, 100% { transform: scale(1); opacity: 0.7; }
		50% { transform: scale(1.1); opacity: 1; }
	}

	/* Modal */
	.modal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
	}

	/* Flip Container */
	.flip-container {
		perspective: 800px;
		width: 340px;
		height: 460px;
	}

	.flip-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 600ms ease-in-out;
		transform-style: preserve-3d;
	}

	.flip-inner.flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	/* ==================== CARD BACK ==================== */
	.card-back {
		background: var(--color-bg-dark);
		border: 3px solid var(--card-color, var(--color-border-accent));
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
	}

	.back-pattern {
		position: absolute;
		inset: 0;
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		gap: 24px;
		padding: 32px;
		opacity: 0.08;
		pointer-events: none;
	}

	.paw-dot {
		font-size: 22px;
	}

	.back-center {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		z-index: 1;
	}

	.back-paw-main {
		font-size: 64px;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
	}

	.back-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text-accent);
		letter-spacing: 0.3em;
		text-transform: uppercase;
	}

	.back-subtitle {
		font-size: 10px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		letter-spacing: 0.4em;
	}

	/* ==================== CARD FRONT ==================== */
	.card-front {
		transform: rotateY(180deg);
		background: var(--color-bg-card);
		border: 3px solid var(--card-color, var(--color-border-accent));
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
		display: flex;
		flex-direction: column;
		padding: 20px 22px 16px;
	}

	/* Header */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0;
	}

	.header-brand {
		font-size: 12px;
		font-weight: 700;
		color: var(--color-text-accent);
		letter-spacing: 0.2em;
	}

	.header-type {
		font-size: 10px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		letter-spacing: 0.15em;
	}

	.header-divider {
		height: 1.5px;
		margin: 10px 0 14px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--card-color, var(--color-border-accent)),
			transparent
		);
	}

	/* Dog info — centered layout */
	.dog-info-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.dog-avatar-large {
		width: 140px;
		height: 140px;
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--card-color, #c1e6df) 20%, var(--color-bg-card)) 0%,
			color-mix(in srgb, var(--card-color, #c1e6df) 8%, var(--color-bg-card)) 100%
		);
		border: 1.5px solid color-mix(in srgb, var(--card-color, #c1e6df) 50%, transparent);
	}

	.dog-img-large {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.dog-card-name {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		margin: 4px 0 0;
		line-height: 1.2;
	}

	.dog-card-meta {
		font-size: 12px;
		color: var(--color-text-secondary);
		text-align: center;
		margin: 0;
		letter-spacing: 0.05em;
	}

	.dog-card-ai {
		font-size: 11px;
		color: var(--color-text-tertiary);
		text-align: center;
		margin: 0;
		font-style: italic;
	}
	.dog-card-roast-intro {
		font-size: 9px;
		color: var(--color-text-tertiary);
		text-align: center;
		margin: 4px 0 0 0;
	}
	.dog-card-quip {
		font-size: 11px;
		font-weight: 600;
		font-style: italic;
		color: var(--color-text-primary);
		text-align: center;
		line-height: 1.4;
		margin: 1px 0 0 0;
		padding: 0 8px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Bottom — QR + recovery code row */
	.card-bottom {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 0 8px;
		border-top: 1px dashed color-mix(in srgb, var(--card-color, var(--color-border)) 60%, var(--color-border));
		margin-top: auto;
	}

	.bottom-left {
		flex-shrink: 0;
	}

	.qr-small {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
	}

	.bottom-right {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.code-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.code-text {
		font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: 0.08em;
	}

	.toggle-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-bg-muted);
		border-radius: var(--radius-sm);
		font-size: 14px;
		transition: background 150ms ease;
		cursor: pointer;
		border: 1px solid var(--color-border);
		flex-shrink: 0;
		padding: 0;
	}

	.toggle-btn:hover {
		background: var(--color-border);
	}

	.kennel-id {
		font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
		font-size: 10px;
		color: var(--color-text-tertiary);
		letter-spacing: 0.05em;
	}

	/* Footer */
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 6px;
		font-size: 9px;
		color: var(--color-text-tertiary);
	}

	/* ==================== ACTIONS ==================== */
	.actions {
		display: flex;
		gap: var(--space-sm);
		animation: fade-in 400ms ease forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.action-btn {
		padding: 10px 20px;
		border-radius: var(--radius-full);
		font-size: 14px;
		font-weight: 600;
		transition: all 150ms ease;
		cursor: pointer;
	}

	.first-time-hint {
		font-size: 14px;
		font-weight: 600;
		color: #C75050;
		text-align: center;
		margin: 0 0 8px;
		padding: 0 16px;
		line-height: 1.5;
	}

	.save-btn {
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.save-btn:hover {
		background: #fff;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.close-btn {
		background: transparent;
		color: var(--color-text-on-dark);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.5);
	}

	/* Mobile: full width */
	@media (max-width: 400px) {
		.flip-container {
			width: 100%;
			max-width: 340px;
		}

		.overlay {
			padding: var(--space-sm);
		}
	}

	/* Mobile save preview */
	.save-preview-overlay {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.save-preview-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 340px;
		width: 100%;
	}
	.save-hint {
		color: white;
		font-size: 15px;
		font-weight: 600;
		text-align: center;
		margin: 0;
	}
	.save-preview-img {
		width: 100%;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}
	.save-preview-close {
		padding: 10px 24px;
		border-radius: var(--radius-md);
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		font-size: 14px;
		cursor: pointer;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.flip-inner {
			transition: none;
		}
		.loading-paw {
			animation: none;
		}
		.actions {
			animation: none;
		}
	}
</style>
