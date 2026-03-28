<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dog } from '$lib/data/dogs';
	import { generateQRDataURL } from '$lib/utils/qrcode';

	interface Props {
		dog: Dog;
		kennelId: string;
		recoveryCode: string; // empty = visitor/share mode, no recovery code shown
		aiName: string;
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
		issuedDate,
		isFirstTime,
		locale,
		onclose,
	}: Props = $props();

	const isZh = $derived(locale === 'zh');

	let phase: 'loading' | 'ready' | 'flipped' = $state('loading');
	let showCode: boolean = $state(true);
	let qrDataURL: string = $state('');

	$effect(() => {
		showCode = isFirstTime;
	});
	let cardRef: HTMLElement | null = $state(null);

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
		const { toPng } = await import('html-to-image');
		const url = await toPng(cardRef, { pixelRatio: 2 });
		const link = document.createElement('a');
		link.download = `punkgo-kennel-${kennelId}.png`;
		link.href = url;
		link.click();
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
					<div class="card-face card-back">
						<div class="back-content">
							<span class="back-paw">&#128062;</span>
							<span class="back-title">PUNKGO ROAST</span>
						</div>
					</div>

					<!-- Card Front -->
					<div class="card-face card-front" bind:this={cardRef}>
						<div class="front-content">
							<!-- Header -->
							<div class="card-header">
								<span class="header-brand">PUNKGO ROAST</span>
								<span class="header-type">AI DOG CARD</span>
							</div>
							<div class="header-divider"></div>

							<!-- Dog Info Section -->
							<div class="info-section">
								<div class="dog-avatar">
									<img
										src="/dogs/felt-{dog.id}-nobg.png"
										alt={isZh ? dog.nameZh : dog.name}
										class="dog-img"
									/>
								</div>
								<div class="info-fields">
									<div class="field">
										<span class="field-label">{isZh ? '名称' : 'Name'}</span>
										<span class="field-value">{isZh ? dog.nameZh : dog.name}</span>
									</div>
									<div class="field">
										<span class="field-label">{isZh ? '犬种' : 'Breed'}</span>
										<span class="field-value">{dog.breed}</span>
									</div>
									<div class="field">
										<span class="field-label">{isZh ? '类型' : 'Type'}</span>
										<span class="field-value">{dog.mbti}</span>
									</div>
									<div class="field">
										<span class="field-label">AI</span>
										<span class="field-value">{aiName}</span>
									</div>
									<div class="field">
										<span class="field-label">ID</span>
										<span class="field-value field-id">k/{kennelId}</span>
									</div>
								</div>
							</div>

							<!-- QR + Recovery Code Section -->
							<div class="code-section">
								{#if qrDataURL}
									<img src={qrDataURL} alt="QR Code" class="qr-code" />
								{/if}
								{#if recoveryCode}
									<div class="code-area">
										<span class="code-display">{displayCode}</span>
										{#if !isFirstTime}
											<button
												class="toggle-btn"
												onclick={toggleCode}
												aria-label={showCode ? 'Hide recovery code' : 'Show recovery code'}
											>
												{showCode ? '🙈' : '👁'}
											</button>
										{/if}
									</div>
								{/if}
							</div>

							{#if recoveryCode}
								<p class="warning-text">{warningText}</p>
							{/if}

							<!-- Footer -->
							<div class="card-footer">
								<span class="footer-date">{isZh ? '签发' : 'Issued'}: {formattedDate()}</span>
								<span class="footer-url">roast.punkgo.ai</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Actions (fade in after flip) -->
			{#if phase === 'flipped'}
				{#if isFirstTime}
					<p class="first-time-hint">
						⚠️ {isZh ? '这张狗卡是你进入狗窝的唯一凭证，请务必下载保存！' : 'This dog card is your only key to the kennel. Download and save it!'}
					</p>
				{/if}
				<div class="actions">
					<button class="action-btn save-btn" onclick={saveAsPng}>
						&#128248; {isZh ? '下载保存狗卡' : 'Download Dog Card'}
					</button>
					<button class="action-btn close-btn" onclick={onclose}>
						&#10005; {isZh ? '关闭' : 'Close'}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Overlay */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		backdrop-filter: blur(4px);
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
		0%,
		100% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
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
		height: 480px;
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

	/* Card Back */
	.card-back {
		background: var(--color-bg-dark);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.back-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
	}

	.back-paw {
		font-size: 60px;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
	}

	.back-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text-accent);
		letter-spacing: 0.3em;
		text-transform: uppercase;
	}

	/* Card Front */
	.card-front {
		transform: rotateY(180deg);
		background: var(--color-bg-card);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.2),
			0 1px 0 var(--color-border-accent);
	}

	.front-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 20px;
		gap: 10px;
	}

	/* Header */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-brand {
		font-size: 11px;
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
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--color-border-accent),
			transparent
		);
	}

	/* Info Section */
	.info-section {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}

	.dog-avatar {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: linear-gradient(135deg, var(--color-bg-muted) 0%, var(--color-bg) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--color-border);
	}

	.dog-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.info-fields {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.field {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.field-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		letter-spacing: 0.05em;
		min-width: 36px;
		flex-shrink: 0;
	}

	.field-value {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.field-id {
		font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
		font-size: 12px;
		color: var(--color-text-accent);
	}

	/* QR + Code Section */
	.code-section {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
		border-top: 1px dashed var(--color-border);
		border-bottom: 1px dashed var(--color-border);
	}

	.qr-code {
		width: 100px;
		height: 100px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.code-area {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.code-display {
		font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: 0.1em;
		word-break: break-all;
	}

	.toggle-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: var(--color-bg-muted);
		border-radius: var(--radius-md);
		font-size: 18px;
		transition: background 150ms ease;
		cursor: pointer;
		border: 1px solid var(--color-border);
	}

	.toggle-btn:hover {
		background: var(--color-border);
	}

	/* Warning */
	.warning-text {
		font-size: 10px;
		color: var(--color-text-tertiary);
		text-align: center;
		line-height: 1.5;
		padding: 0 4px;
	}
	.code-hint {
		font-size: 11px;
		color: var(--color-text-tertiary);
		font-style: italic;
		text-align: center;
		margin: 4px 0 0;
	}

	/* Footer */
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
	}

	.footer-date {
		font-size: 9px;
		color: var(--color-text-tertiary);
	}

	.footer-url {
		font-size: 9px;
		color: var(--color-text-tertiary);
		letter-spacing: 0.05em;
	}

	/* Actions */
	.actions {
		display: flex;
		gap: var(--space-sm);
		animation: fade-in 400ms ease forwards;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
