<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import confetti from 'canvas-confetti';
	import { decodeResultId, getDogByMBTI, type Dog } from '$lib/data/dogs';
	import { toPng } from 'html-to-image';

	let isZh = $state(false);
	let dog: Dog | null = $state(null);
	let resultId = $state('');

	const funFacts = [
		{ en: 'The average person says "thank you" to AI 3.7 times per session', zh: '平均每个人每次对话会对 AI 说 3.7 次"谢谢"' },
		{ en: '47% of AI users have chatted with AI past midnight', zh: '47% 的 AI 用户在午夜后还在跟 AI 聊天' },
		{ en: 'ENTJ users write the longest prompts on average', zh: 'ENTJ 用户平均写最长的 prompt' },
		{ en: 'INFP users are most likely to apologize to AI', zh: 'INFP 用户最可能跟 AI 道歉' },
		{ en: 'The most common AI vibe is The Googler (ENTP)', zh: '最常见的 AI 人格是搜索怪 (ENTP)' },
	];

	// Reveal ceremony states
	let phase: 'loading' | 'card-back' | 'flipping' | 'revealed' = $state('loading');
	let typedQuip = $state('');
	let showActions = $state(false);
	let loadingFact = $state(funFacts[0]);
	let cardRef: HTMLElement | null = $state(null);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		resultId = $page.params.id;
		loadingFact = funFacts[Math.floor(Math.random() * funFacts.length)];
		try {
			const mbti = decodeResultId(resultId);
			dog = getDogByMBTI(mbti);
		} catch {
			dog = null;
		}

		// Full ceremony: loading (2.5s) → card-back (1.5s) → flip → reveal
		if (dog) {
			setTimeout(() => { phase = 'card-back'; }, 2500);
			setTimeout(() => { phase = 'flipping'; }, 4000);
			setTimeout(() => {
				phase = 'revealed';
				fireConfetti();
				typewriterQuip();
			}, 4600);
			setTimeout(() => { showActions = true; }, 6000);
		}
	});

	$effect(() => { resultId = $page.params.id; });

	function fireConfetti() {
		const colors = ['#5A8C6A', '#C4956A', '#D4B896', '#8060A0', '#C75050'];
		confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors, startVelocity: 30, gravity: 1.2, ticks: 120 });
		setTimeout(() => {
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.4, x: 0.3 }, colors, startVelocity: 25, gravity: 1.0 });
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.4, x: 0.7 }, colors, startVelocity: 25, gravity: 1.0 });
		}, 200);
	}

	function typewriterQuip() {
		if (!dog) return;
		const full = isZh ? dog.quipZh : dog.quip;
		let i = 0;
		const interval = setInterval(() => {
			typedQuip = full.slice(0, i + 1);
			i++;
			if (i >= full.length) clearInterval(interval);
		}, 35);
	}

	function shareToX() {
		if (!dog) return;
		const text = `I'm ${dog.name} — "${dog.catchphrase}" 🐕 What's YOUR AI vibe?`;
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
	}

	function shareToWeibo() {
		if (!dog) return;
		const text = `AI 说我是${dog.nameZh}——"${dog.quipZh}" 🐕 你是哪只狗？`;
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
	}

	function shareToWhatsApp() {
		if (!dog) return;
		const text = `I'm ${dog.name} — "${dog.catchphrase}" 🐕 What's YOUR AI vibe? https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
	}

	let copied = $state(false);
	function copyLink() {
		navigator.clipboard.writeText(`https://roast.punkgo.ai/s/${resultId}`).then(() => {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		});
	}

	async function saveCard() {
		if (!cardRef) return;
		try {
			const dataUrl = await toPng(cardRef, { pixelRatio: 2 });
			const link = document.createElement('a');
			link.download = `punkgo-roast-${dog?.id || 'card'}.png`;
			link.href = dataUrl;
			link.click();
		} catch {
			// Fallback: copy link
			navigator.clipboard.writeText(`https://roast.punkgo.ai/s/${resultId}`);
			alert(isZh ? '下载失败，链接已复制' : 'Download failed. Link copied.');
		}
	}
</script>

<svelte:head>
	<title>{dog ? `${dog.name} — PunkGo Roast` : 'Result — PunkGo Roast'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="reveal-page">
	{#if dog}
		{#if phase === 'loading'}
			<!-- Loading ceremony -->
			<div class="ceremony">
				<span class="section-tag">— A N A L Y Z I N G —</span>
				<div class="paw-ring">🐾</div>
				<h2 class="loading-title">{isZh ? '正在检测你的 AI 人格...' : 'Examining your AI personality...'}</h2>
				<p class="loading-sub">{isZh ? '匹配十六个犬种之一' : 'Matching you with one of sixteen breeds'}</p>
				<div class="loading-bar"><div class="loading-fill"></div></div>
				<div class="fun-fact">
					<span class="section-tag">— D I D &nbsp; Y O U &nbsp; K N O W ? —</span>
					<p>{isZh ? loadingFact.zh : loadingFact.en}</p>
				</div>
			</div>

		{:else if phase === 'card-back'}
			<!-- Card back: anticipation -->
			<div class="ceremony">
				<div class="flip-card">
					<div class="card-back" style="background:{dog.cardColor}">
						<span class="card-back-paw">🐾</span>
						<span class="card-back-text">{isZh ? '你的 AI 人格是...' : 'Your AI personality is...'}</span>
					</div>
				</div>
				<p class="tap-hint">{isZh ? '即将揭晓...' : 'Revealing...'}</p>
			</div>

		{:else if phase === 'flipping'}
			<!-- Flip animation -->
			<div class="ceremony">
				<div class="flip-card flipping">
					<div class="card-back" style="background:{dog.cardColor}">
						<span class="card-back-paw">🐾</span>
					</div>
				</div>
			</div>

		{:else}
			<!-- Revealed -->
			<div class="reveal-body">
				<div class="quip-side">
					<span class="section-tag fade-in">— Y O U R &nbsp; R E S U L T —</span>
					<img class="avatar fade-in d1" src="/dogs/dog-{dog.id}.png" alt={dog.name} />
					<h1 class="fade-in d2">{dog.name}</h1>
					<div class="mbti-row fade-in d2">
						<span class="mbti-badge">{dog.mbti}</span>
						<span class="breed">{dog.breed}</span>
					</div>
					<p class="quip fade-in d3">"{typedQuip}<span class="cursor">|</span>"</p>
					<p class="catch fade-in d4">— {isZh ? dog.catchphraseZh : dog.catchphrase}</p>
					{#if showActions}
						<div class="actions fade-in">
							<button class="btn-x" onclick={shareToX}>𝕏 Share</button>
							<button class="btn-weibo" onclick={shareToWeibo}>微博</button>
							<button class="btn-wa" onclick={shareToWhatsApp}>WhatsApp</button>
							<button class="btn-save" onclick={saveCard}>Save Card</button>
							<button class="btn-copy" onclick={copyLink}>{copied ? (isZh ? '已复制!' : 'Copied!') : 'Copy Link'}</button>
						</div>
					{/if}
				</div>
				<div class="card-side">
					<span class="section-tag">— Y O U R &nbsp; S H A R E &nbsp; C A R D —</span>
					<p class="card-hint">{isZh ? '保存这张卡，分享给朋友看看你是哪只狗' : 'Save this card and share it with friends'}</p>
					<div class="card-preview" style="background:{dog.cardColor}" bind:this={cardRef}>
						<img class="card-dog-img" src="/dogs/dog-{dog.id}.png" alt={dog.name} />
						<span class="card-name">{dog.name}</span>
						<span class="card-mbti">{dog.mbti}</span>
						<p class="card-quip">"{isZh ? dog.quipZh : dog.quip}"</p>
						<div class="card-footer">
							<span>punkgo.ai</span>
							<span>What's your AI vibe?</span>
						</div>
					</div>
					<button class="card-save-btn" onclick={saveCard}>💾 {isZh ? '保存卡片' : 'Save Card'}</button>
					<a href="/quiz" class="retake">{isZh ? '不是你？重新测试 →' : 'Not you? Retake →'}</a>
				</div>
			</div>

			<div class="ext-upsell fade-in d5">
				<div class="ext-left">
					<span class="section-tag">— W A N T &nbsp; S C A R Y &nbsp; A C C U R A C Y ? —</span>
					<h3>{isZh ? '这只是基于 5 道题。\n想象你的真实 AI 数据能揭示什么。' : "This was based on 5 questions.\nImagine what your real AI data reveals."}</h3>
					<p>{isZh ? '扩展分析你真实的聊天记录 — 100% 本地，零数据外传。' : 'The extension analyzes your actual chat history — 100% local, zero data leaves your device.'}</p>
				</div>
				<a href="https://github.com/PunkGo/punkgo-roast-extension" target="_blank" class="ext-btn">🧩 {isZh ? '安装扩展' : 'Get Extension'}</a>
			</div>
		{/if}
	{:else}
		<div class="placeholder">
			<span class="section-tag">— N O T &nbsp; F O U N D —</span>
			<h2>{isZh ? '这个结果不存在' : "This result doesn't exist"}</h2>
			<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
		</div>
	{/if}
</div>

<style>
	.reveal-page { min-height: calc(100vh - 56px); display: flex; flex-direction: column; }

	/* Loading */
	.paw-ring {
		width: 120px; height: 120px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		border: 2px solid var(--color-border-accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 48px;
		animation: gentle-pulse 2s ease-in-out infinite;
	}
	.loading-title { font-size: 22px; font-weight: 700; }
	.loading-sub { font-size: 14px; color: var(--color-text-secondary); }
	.loading-bar { width: 200px; height: 4px; border-radius: var(--radius-full); background: var(--color-border); overflow: hidden; }
	.loading-fill { height: 100%; border-radius: var(--radius-full); background: var(--color-cta); animation: loadProgress 2.5s ease-in-out forwards; }
	@keyframes loadProgress { 0% { width: 0; } 80% { width: 70%; } 100% { width: 95%; } }
	.fun-fact { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 16px; }
	.fun-fact p { font-size: 13px; color: var(--color-text-tertiary); max-width: 380px; text-align: center; }

	/* Ceremony — card back + flip */
	.ceremony {
		flex: 1; display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 24px;
	}
	.flip-card {
		width: 300px; height: 400px;
		perspective: 1200px;
	}
	.card-back {
		width: 100%; height: 100%;
		border-radius: var(--radius-xl);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 16px;
		border: 2px solid var(--color-border-accent);
		transition: transform 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
		animation: gentle-pulse 2s ease-in-out infinite;
	}
	.flipping .card-back {
		animation: flip-away 600ms ease-in forwards;
	}
	.card-back-paw { font-size: 48px; opacity: 0.6; }
	.card-back-text {
		font-size: 16px; font-weight: 600; color: var(--color-text-secondary);
		letter-spacing: 0.05em;
	}
	.tap-hint {
		font-size: 14px; color: var(--color-text-tertiary);
		animation: pulse-opacity 1.5s ease-in-out infinite;
	}

	@keyframes gentle-pulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(90, 140, 106, 0.15); }
		50% { box-shadow: 0 0 0 12px rgba(90, 140, 106, 0); }
	}
	@keyframes flip-away {
		0% { transform: rotateY(0); }
		100% { transform: rotateY(90deg); opacity: 0; }
	}
	@keyframes pulse-opacity {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}

	/* Revealed content */
	.reveal-body { display: flex; flex: 1; }
	.quip-side {
		flex: 1; display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 16px; padding: 48px 64px; text-align: center;
	}
	.avatar { width: 160px; height: 160px; border-radius: var(--radius-full); border: 2px solid var(--color-border-accent); object-fit: cover; }
	.quip-side h1 { font-size: 32px; font-weight: 700; letter-spacing: 0.05em; }
	.mbti-row { display: flex; align-items: center; gap: 10px; }
	.mbti-badge {
		font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
		padding: 4px 14px; border-radius: var(--radius-sm);
		background: var(--color-bg-muted); border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.breed { font-size: 13px; color: var(--color-text-tertiary); }
	.quip { font-size: 22px; font-weight: 600; font-style: italic; line-height: 1.5; max-width: 460px; min-height: 66px; }
	.cursor { animation: blink 0.8s step-end infinite; font-style: normal; color: var(--color-cta); }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	.catch { font-size: 14px; color: var(--color-text-secondary); font-style: italic; }

	.actions { display: flex; gap: 10px; padding-top: 12px; flex-wrap: wrap; justify-content: center; }
	.actions button { padding: 10px 18px; border-radius: var(--radius-md); font-size: 12px; font-weight: 600; transition: transform 150ms ease, opacity 150ms ease; }
	.actions button:hover { transform: translateY(-1px); }
	.btn-x { background: #1A1A1A; color: white; }
	.btn-weibo { background: #E6162D; color: white; }
	.btn-wa { background: #25D366; color: white; }
	.btn-save { background: var(--color-cta); color: white; }
	.btn-copy { background: var(--color-bg-muted); color: var(--color-text-secondary); }

	.card-side {
		width: 480px; background: var(--color-bg-muted);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 16px; padding: 40px;
	}
	.card-hint { font-size: 13px; color: var(--color-text-secondary); }
	.card-save-btn {
		padding: 10px 24px; border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 13px; font-weight: 700;
		transition: transform 150ms ease;
	}
	.card-save-btn:hover { transform: translateY(-1px); }
	.card-preview {
		width: 300px; height: 400px; border-radius: var(--radius-lg);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 12px;
		padding: 24px; border: 1px solid var(--color-border-accent);
	}
	.card-dog-img { width: 64px; height: 64px; border-radius: var(--radius-full); object-fit: cover; }
	.card-name { font-size: 14px; font-weight: 700; color: #3A2518; letter-spacing: 0.05em; }
	.card-mbti { font-size: 10px; font-weight: 700; color: #5A8C6A; letter-spacing: 0.15em; }
	.card-quip { font-size: 12px; font-weight: 600; font-style: italic; text-align: center; color: #3A2518; line-height: 1.4; max-width: 240px; }
	.card-footer { display: flex; justify-content: space-between; width: 100%; }
	.card-footer span { font-size: 9px; color: #8B7060; }
	.retake { font-size: 13px; color: var(--color-text-secondary); }

	.ext-upsell {
		display: flex; align-items: center; justify-content: center;
		gap: 40px; padding: 32px 48px;
		background: var(--color-bg-muted); border-top: 1px solid var(--color-border);
	}
	.ext-left { display: flex; flex-direction: column; gap: 6px; max-width: 480px; }
	.ext-left h3 { font-size: 18px; font-weight: 700; line-height: 1.3; white-space: pre-line; }
	.ext-left p { font-size: 13px; color: var(--color-text-secondary); }
	.ext-btn {
		padding: 12px 24px; border-radius: var(--radius-md);
		background: var(--color-bg-dark); color: var(--color-text-on-dark);
		font-size: 13px; font-weight: 700; white-space: nowrap;
	}

	.placeholder {
		display: flex; flex-direction: column; align-items: center;
		justify-content: center; min-height: calc(100vh - 56px); gap: 16px;
	}
	.cta-btn {
		padding: 12px 32px; border-radius: var(--radius-md);
		background: var(--color-cta); color: white; font-size: 15px; font-weight: 700;
	}

	/* Fade-in animations */
	.fade-in { animation: fadeInUp 0.5s ease-out both; }
	.d1 { animation-delay: 0.1s; }
	.d2 { animation-delay: 0.2s; }
	.d3 { animation-delay: 0.4s; }
	.d4 { animation-delay: 0.8s; }
	.d5 { animation-delay: 1.2s; }

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(16px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 768px) {
		.reveal-body { flex-direction: column; }
		.card-side { width: 100%; }
		.ext-upsell { flex-direction: column; text-align: center; }
		.quip { font-size: 18px; }
	}

	@media (prefers-reduced-motion: reduce) {
		.card-back { animation: none; }
		.flipping .card-back { animation: none; }
		.tap-hint { animation: none; opacity: 1; }
		.fade-in { animation: none; opacity: 1; }
		.cursor { animation: none; }
	}
</style>
