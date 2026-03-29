<script lang="ts">
	import type { Dog } from '$lib/data/dogs';

	type Phase = 'name' | 'stamping' | 'reveal';

	interface Props {
		dog: Dog;
		locale: string;
		aiName: string;
		quip: string;
		intro: string;
		onComplete: (nickname: string, kennelId: string, recoveryCode: string) => void;
		onClose: () => void;
	}

	let { dog, locale, aiName, quip, intro, onComplete, onClose }: Props = $props();
	const isZh = $derived(locale === 'zh');

	let phase: Phase = $state('name');
	let nickname = $state('');
	let creating = $state(false);
	let error = $state('');

	// Stamping animation state
	let stampPhase = $state(0); // 0-5 steps
	let kennelId = $state('');
	let recoveryCode = $state('');

	const maxLen = 10;
	const charCount = $derived(nickname.length);

	async function startStamping() {
		if (!nickname.trim() || creating) return;
		creating = true;
		error = '';
		phase = 'stamping';
		stampPhase = 0;

		// Step 1: card appears
		await tick(500);
		stampPhase = 1; // nickname writes in

		// Step 2: call API while animating
		try {
			const res = await fetch('/api/kennel/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					resultId: '',
					mbti: dog.mbti,
					aiType: aiName.toLowerCase(),
					dogId: dog.id,
					quip: intro && quip ? `${intro}|${quip}` : quip || (isZh ? dog.quipZh : dog.quip),
					locale,
					nickname: nickname.trim(),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error('create failed');
			kennelId = data.kennelId;
			recoveryCode = data.recoveryCode;
		} catch {
			error = isZh ? '创建失败，请重试' : 'Failed, please retry';
			phase = 'name';
			creating = false;
			return;
		}

		await tick(500);
		stampPhase = 2; // MBTI + breed fade in

		await tick(500);
		stampPhase = 3; // QR scan line

		await tick(300);
		stampPhase = 4; // STAMP!

		await tick(800);
		stampPhase = 5; // confetti + transition to reveal

		await tick(500);
		phase = 'reveal';
		fireConfetti();
	}

	function tick(ms: number) {
		return new Promise(r => setTimeout(r, ms));
	}

	function fireConfetti() {
		import('canvas-confetti').then(({ default: confetti }) => {
			confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
		});
	}

	let revealCardRef: HTMLElement | null = $state(null);
	const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

	async function saveAndEnter() {
		if (!kennelId) return;
		sessionStorage.setItem('punkgo_recovery', recoveryCode);

		if (!isMobile && revealCardRef) {
			// Desktop: save PNG then enter kennel
			try {
				const html2canvas = (await import('html2canvas')).default;
				const canvas = await html2canvas(revealCardRef, { scale: 2, useCORS: true, backgroundColor: null });
				const url = canvas.toDataURL('image/png');
				const link = document.createElement('a');
				link.download = `punkgo-dogcard-${nickname || dog.id}.png`;
				link.href = url;
				link.click();
				// Wait a moment for download to start
				await tick(500);
			} catch {}
		}

		onComplete(nickname.trim(), kennelId, recoveryCode);
	}

	function enterKennel() {
		if (!kennelId) return;
		sessionStorage.setItem('punkgo_recovery', recoveryCode);
		onComplete(nickname.trim(), kennelId, recoveryCode);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" onclick={phase === 'name' ? onClose : undefined}>
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>

		{#if phase === 'name'}
			<!-- Phase 1: Name your dog -->
			<div class="name-phase">
				<img class="name-dog-avatar" src="/dogs/felt-{dog.id}-chat.png" alt={dog.breed} />
				<h3 class="name-title">{isZh ? '🐕 给你的狗子起个名字' : '🐕 Name your dog'}</h3>
				<span class="name-breed">{isZh ? dog.breedZh : dog.breed}</span>
				<div class="name-input-wrap">
					<input
						class="name-input"
						bind:value={nickname}
						placeholder={isZh ? '比如：小柴蛋蛋' : 'e.g. Buddy'}
						maxlength={maxLen}
						oninput={() => { error = ''; }}
						onkeydown={(e) => { if (e.key === 'Enter' && nickname.trim()) startStamping(); }}
					/>
					<span class="name-count" class:warn={charCount > maxLen - 2}>{charCount}/{maxLen}</span>
				</div>
				{#if error}
					<p class="name-error">{error}</p>
				{/if}
				<button
					class="stamp-btn"
					disabled={!nickname.trim() || creating}
					onclick={startStamping}
				>
					🪪 {isZh ? '制作狗证' : 'Make Dog Card'}
				</button>
				<button class="close-btn" onclick={onClose}>{isZh ? '取消' : 'Cancel'}</button>
			</div>

		{:else if phase === 'stamping'}
			<!-- Phase 2: Stamping animation -->
			<div class="stamp-phase">
				<div class="stamp-card" class:step1={stampPhase >= 1} class:step2={stampPhase >= 2} class:step3={stampPhase >= 3} class:step4={stampPhase >= 4} class:step5={stampPhase >= 5}>
					<!-- Card content builds up progressively -->
					<div class="sc-header">
						<span class="sc-brand">{isZh ? '胖狗' : 'PUNKGO'}</span>
						{#if stampPhase >= 2}
							<span class="sc-mbti fade-in">{dog.mbti}</span>
						{/if}
					</div>
					{#if stampPhase >= 1}
						<div class="sc-name typewriter">{nickname}</div>
					{/if}
					{#if stampPhase >= 2}
						<div class="sc-breed fade-in">{isZh ? dog.breedZh : dog.breed}</div>
					{/if}
					{#if stampPhase >= 3}
						<div class="sc-qr fade-in">
							<div class="qr-scan"></div>
						</div>
					{/if}
					{#if stampPhase >= 4}
						<div class="sc-stamp stamp-hit">
							<span>✓</span>
						</div>
					{/if}
				</div>
				<p class="stamp-status">
					{stampPhase < 2 ? (isZh ? '正在写入信息...' : 'Writing info...')
					: stampPhase < 4 ? (isZh ? '生成狗证...' : 'Generating card...')
					: (isZh ? '盖章认证！' : 'Stamped!')}
				</p>
			</div>

		{:else if phase === 'reveal'}
			<!-- Phase 3: Reveal -->
			<div class="reveal-phase">
				<h3 class="reveal-title">{isZh ? '🎉 狗证制作完成！' : '🎉 Dog Card Ready!'}</h3>
				<div class="reveal-card" bind:this={revealCardRef}>
					<div class="rc-left">
						<img src="/dogs/felt-{dog.id}-chat.png" alt={nickname} />
					</div>
					<div class="rc-right">
						<div class="rc-top">
							<div class="rc-header">
								<span class="rc-brand">{isZh ? '胖狗' : 'PUNKGO'}</span>
								<span class="rc-mbti">{dog.mbti}</span>
							</div>
							<span class="rc-name">{nickname}</span>
							<span class="rc-breed">{isZh ? dog.breedZh : dog.breed}</span>
						</div>
						<div class="rc-divider"></div>
						<div class="rc-bottom">
							<div class="rc-qr-box"></div>
							<div class="rc-codes">
								<span class="rc-code">{recoveryCode}</span>
								<span class="rc-url">roast.punkgo.ai/k/{kennelId}/web</span>
							</div>
						</div>
					</div>
				</div>
				<p class="reveal-warn">⚠️ {isZh ? '恢复码是你的狗证钥匙，请妥善保管！' : 'Recovery code is your card key — save it!'}</p>
				<div class="reveal-actions">
					{#if isMobile}
						<p class="mobile-hint">{isZh ? '📱 请截图保存狗证' : '📱 Please screenshot to save'}</p>
						<button class="action-btn primary" onclick={enterKennel}>
							🏠 {isZh ? '进入狗窝' : 'Enter Kennel'}
						</button>
					{:else}
						<button class="action-btn primary" onclick={saveAndEnter}>
							💾 {isZh ? '保存狗证并进入狗窝' : 'Save Card & Enter Kennel'}
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed; inset: 0; z-index: 9000;
		background: rgba(0,0,0,0.5);
		display: flex; align-items: center; justify-content: center;
		padding: 20px;
		backdrop-filter: blur(4px);
	}
	.modal-content {
		background: #F5F0E8;
		border-radius: 20px;
		max-width: 360px; width: 100%;
		padding: 28px 24px;
		box-shadow: 0 16px 48px rgba(40, 24, 12, 0.25);
		position: relative;
	}

	/* === Name Phase === */
	.name-phase {
		display: flex; flex-direction: column; align-items: center; gap: 12px;
	}
	.name-dog-avatar {
		width: 80px; height: 80px; object-fit: contain;
		filter: drop-shadow(0 4px 12px rgba(40,24,12,0.1));
	}
	.name-title {
		font-size: 18px; font-weight: 700; color: #2A1810;
		text-align: center;
	}
	.name-breed {
		font-size: 12px; color: #A0907E;
		background: rgba(212, 201, 184, 0.35);
		padding: 2px 12px; border-radius: 8px;
	}
	.name-input-wrap {
		width: 100%; position: relative; margin-top: 4px;
	}
	.name-input {
		width: 100%;
		border: 1.5px solid #D4C9B8;
		border-radius: 12px;
		padding: 12px 50px 12px 16px;
		font-size: 18px; font-weight: 700;
		color: #2A1810;
		background: #fff;
		outline: none;
		text-align: center;
		font-family: inherit;
	}
	.name-input:focus { border-color: #C08040; }
	.name-input::placeholder { color: #C0B8A8; font-weight: 400; }
	.name-count {
		position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
		font-size: 11px; color: #A0907E;
	}
	.name-count.warn { color: #C06030; }
	.name-error { font-size: 12px; color: #C04030; margin: 0; }
	.stamp-btn {
		width: 100%; padding: 14px;
		background: #C08040; color: #fff;
		border: none; border-radius: 12px;
		font-size: 16px; font-weight: 700;
		cursor: pointer; margin-top: 4px;
		font-family: inherit;
	}
	.stamp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.stamp-btn:hover:not(:disabled) { background: #A06830; }
	.close-btn {
		background: none; border: none; color: #A0907E;
		font-size: 13px; cursor: pointer; padding: 8px;
		font-family: inherit;
	}

	/* === Stamping Phase === */
	.stamp-phase {
		display: flex; flex-direction: column; align-items: center; gap: 16px;
		min-height: 280px; justify-content: center;
	}
	.stamp-card {
		width: 240px; height: 160px;
		background: #fff;
		border: 2px solid #D4C9B8;
		border-radius: 14px;
		padding: 16px;
		display: flex; flex-direction: column;
		gap: 6px;
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		animation: cardAppear 0.5s ease forwards;
	}
	@keyframes cardAppear {
		to { opacity: 1; transform: translateY(0); }
	}
	.sc-header { display: flex; justify-content: space-between; align-items: center; }
	.sc-brand { font-size: 10px; font-weight: 700; color: #2A1810; letter-spacing: 0.15em; }
	.sc-mbti { font-size: 12px; font-weight: 800; color: #C08040; letter-spacing: 0.2em; }
	.sc-name {
		font-size: 20px; font-weight: 900; color: #2A1810;
		overflow: hidden; white-space: nowrap;
		border-right: 2px solid #C08040;
		animation: typing 0.6s steps(10) forwards, blink 0.5s step-end infinite alternate;
	}
	@keyframes typing { from { width: 0; } to { width: 100%; } }
	@keyframes blink { 50% { border-color: transparent; } }
	.sc-breed { font-size: 9px; color: #A0907E; }
	.sc-qr {
		width: 36px; height: 36px;
		background: #f0ece4; border-radius: 4px;
		position: relative; overflow: hidden;
	}
	.qr-scan {
		position: absolute; top: 0; left: 0; right: 0; height: 2px;
		background: #C08040;
		animation: scanDown 0.5s ease-in-out forwards;
	}
	@keyframes scanDown { from { top: 0; } to { top: 100%; } }
	.sc-stamp {
		position: absolute; top: 50%; left: 50%;
		transform: translate(-50%, -50%) scale(3) rotate(-15deg);
		width: 48px; height: 48px;
		background: #C04030;
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		color: #fff; font-size: 24px; font-weight: 900;
		opacity: 0;
	}
	.stamp-hit {
		animation: stampDown 0.3s cubic-bezier(0.32, 0, 0.67, 0) forwards;
	}
	@keyframes stampDown {
		0% { opacity: 0; transform: translate(-50%, -50%) scale(3) rotate(-15deg); }
		60% { opacity: 1; transform: translate(-50%, -50%) scale(0.9) rotate(-15deg); }
		80% { transform: translate(-50%, -50%) scale(1.05) rotate(-15deg); }
		100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-15deg); }
	}
	.stamp-status {
		font-size: 13px; color: #A0907E; text-align: center;
	}
	.fade-in { animation: fadeIn 0.4s ease forwards; }
	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

	/* === Reveal Phase === */
	.reveal-phase {
		display: flex; flex-direction: column; align-items: center; gap: 14px;
	}
	.reveal-title {
		font-size: 18px; font-weight: 700; color: #2A1810;
	}
	.reveal-card {
		width: 100%; height: 170px;
		border-radius: 14px;
		display: flex;
		background: #fff;
		border: 1.5px solid #D4C9B8;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(40, 24, 12, 0.1);
	}
	.rc-left {
		width: 36%;
		display: flex; align-items: flex-end; justify-content: center;
		background: linear-gradient(170deg, #F8F2E8 0%, #EDE0C8 100%);
		padding: 0 0 4px 4px;
	}
	.rc-left img { width: 90%; object-fit: contain; }
	.rc-right {
		width: 64%; padding: 0;
		display: grid; grid-template-rows: 55fr 1px 45fr;
		background: linear-gradient(160deg, #F5F0E8 0%, #EDE5D8 100%);
	}
	.rc-top {
		padding: 10px 14px 0;
		display: flex; flex-direction: column;
	}
	.rc-header {
		display: flex; justify-content: space-between; align-items: center;
		padding-top: 2px; margin-bottom: auto;
	}
	.rc-brand { font-size: 10px; font-weight: 700; color: #2A1810; letter-spacing: 0.15em; }
	.rc-mbti { font-size: 12px; font-weight: 800; color: #C08040; letter-spacing: 0.2em; }
	.rc-name { font-size: 18px; font-weight: 900; color: #2A1810; margin-bottom: 2px; }
	.rc-breed { font-size: 9px; color: #A0907E; margin-bottom: 8px; }
	.rc-divider { background: #E0D8CC; }
	.rc-bottom {
		padding: 0 14px;
		display: flex; align-items: center; gap: 8px;
	}
	.rc-qr-box {
		width: 36px; height: 36px;
		border-radius: 4px; background: #fff;
		border: 1px solid #E8E0D4;
		flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
	}
	.rc-qr-box::after {
		content: 'QR'; font-size: 8px; font-weight: 700; color: #D4C9B8;
	}
	.rc-codes {
		display: flex; flex-direction: column; gap: 1px;
	}
	.rc-code {
		font-size: 11px; font-weight: 700; color: #2A1810;
		letter-spacing: 0.08em;
	}
	.rc-url {
		font-size: 7px; color: #A0907E;
		white-space: nowrap;
	}
	.reveal-warn {
		font-size: 11px; color: #C06030;
		background: #FFF4EC; padding: 8px 14px; border-radius: 10px;
		text-align: center; width: 100%;
	}
	.reveal-actions {
		display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center;
	}
	.mobile-hint {
		font-size: 13px; color: #C08040; font-weight: 600;
		text-align: center; margin: 0;
	}
	.action-btn {
		flex: 1; padding: 12px;
		border-radius: 12px;
		font-size: 14px; font-weight: 700;
		cursor: pointer; border: none;
		font-family: inherit;
	}
	.action-btn.primary {
		background: #C08040; color: #fff;
	}
	.action-btn.primary:hover { background: #A06830; }
	.action-btn.outline {
		background: #fff; color: #2A1810;
		border: 1.5px solid #D4C9B8;
	}
	.action-btn.outline:hover { background: #F5F0E8; }
</style>
