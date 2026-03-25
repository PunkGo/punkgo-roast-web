<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import confetti from 'canvas-confetti';
	import { toPng } from 'html-to-image';
	import { decodeResultId, getDogByMBTI, type Dog } from '$lib/data/dogs';

	let isZh = $state(false);
	let dog: Dog | null = $state(null);
	let resultId = $state('');

	const funFacts = [
		{ en: 'The average person says "thank you" to AI 3.7 times per session', zh: '平均每个人每次对话会对 AI 说 3.7 次"谢谢"' },
		{ en: '47% of AI users have chatted with AI past midnight', zh: '47% 的 AI 用户在午夜后还在跟 AI 聊天' },
		{ en: 'ENTJ users write the longest prompts on average', zh: 'ENTJ 用户平均写最长的 prompt' },
		{ en: 'INFP users are most likely to apologize to AI', zh: 'INFP 用户最可能跟 AI 道歉' },
	];

	let phase: 'loading' | 'card-back' | 'flipping' | 'revealed' = $state('loading');
	let typedQuip = $state('');
	let showActions = $state(false);
	let loadingFact = $state(funFacts[0]);
	let cardRef: HTMLElement | null = $state(null);
	let copied = $state(false);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		resultId = $page.params.id;
		loadingFact = funFacts[Math.floor(Math.random() * funFacts.length)];
		try {
			const mbti = decodeResultId(resultId);
			dog = getDogByMBTI(mbti);
		} catch { dog = null; }

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
		confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors, gravity: 1.2 });
		setTimeout(() => {
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.3, x: 0.3 }, colors });
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.3, x: 0.7 }, colors });
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
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm ${dog.name} — "${dog.catchphrase}" 🐕 What's YOUR AI vibe?`)}&url=${encodeURIComponent(url)}`, '_blank');
	}
	function shareToWeibo() {
		if (!dog) return;
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(`AI 说我是${dog.nameZh}——"${dog.quipZh}" 🐕 你是哪只狗？`)}&url=${encodeURIComponent(url)}`, '_blank');
	}
	function shareToWhatsApp() {
		if (!dog) return;
		window.open(`https://wa.me/?text=${encodeURIComponent(`I'm ${dog.name} — "${dog.catchphrase}" 🐕 https://roast.punkgo.ai/s/${resultId}`)}`, '_blank');
	}
	function copyLink() {
		navigator.clipboard.writeText(`https://roast.punkgo.ai/s/${resultId}`).then(() => {
			copied = true; setTimeout(() => { copied = false; }, 2000);
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
			navigator.clipboard.writeText(`https://roast.punkgo.ai/s/${resultId}`);
		}
	}
</script>

<svelte:head>
	<title>{dog ? `${dog.name} — PunkGo Roast` : 'Result — PunkGo Roast'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Single column, centered, consistent layout across all phases -->
<div class="result-page">
	<div class="center-col">
		{#if !dog}
			<div class="phase-block">
				<span class="section-tag">— N O T &nbsp; F O U N D —</span>
				<h2>{isZh ? '这个结果不存在' : "This result doesn't exist"}</h2>
				<a href="/quiz" class="btn-primary">{isZh ? '开始测试' : 'Begin Examination'}</a>
			</div>

		{:else if phase === 'loading'}
			<div class="phase-block">
				<span class="section-tag">— A N A L Y Z I N G —</span>
				<div class="paw-ring" style="background:{dog.cardColor}">🐾</div>
				<h2>{isZh ? '正在检测你的 AI 人格...' : 'Examining your AI personality...'}</h2>
				<p class="sub">{isZh ? '匹配十六个犬种之一' : 'Matching you with one of sixteen breeds'}</p>
				<div class="progress-bar"><div class="progress-fill"></div></div>
				<div class="fun-fact">
					<span class="section-tag">— D I D &nbsp; Y O U &nbsp; K N O W ? —</span>
					<p>{isZh ? loadingFact.zh : loadingFact.en}</p>
				</div>
			</div>

		{:else if phase === 'card-back' || phase === 'flipping'}
			<div class="phase-block">
				<div class="flip-card" class:flipping={phase === 'flipping'}>
					<div class="card-back-face" style="background:{dog.cardColor}">
						<span class="cb-paw">🐾</span>
						<span class="cb-text">{isZh ? '你的 AI 人格是...' : 'Your AI personality is...'}</span>
					</div>
				</div>
				<p class="revealing">{isZh ? '即将揭晓...' : 'Revealing...'}</p>
			</div>

		{:else}
			<!-- Revealed: single column, everything stacked -->
			<div class="phase-block revealed">
				<span class="section-tag fade-in">— Y O U R &nbsp; R E S U L T —</span>
				<img class="avatar fade-in d1" src="/dogs/dog-{dog.id}.png" alt={dog.name} />
				<h1 class="fade-in d2">{dog.name}</h1>
				<div class="meta fade-in d2">
					<span class="mbti-badge">{dog.mbti}</span>
					<span class="breed">{dog.breed}</span>
				</div>
				<p class="quip fade-in d3">"{typedQuip}<span class="cursor">|</span>"</p>
				<p class="catch fade-in d4">{isZh ? dog.catchphraseZh : dog.catchphrase}</p>

				{#if showActions}
					<!-- Share buttons: icon pills -->
					<div class="share-row fade-in">
						<button class="share-pill" onclick={shareToX} title="Share on X">𝕏</button>
						<button class="share-pill" onclick={shareToWeibo} title="微博">微</button>
						<button class="share-pill" onclick={shareToWhatsApp} title="WhatsApp">W</button>
						<button class="share-pill" onclick={copyLink} title="Copy Link">{copied ? '✓' : '🔗'}</button>
					</div>

					<!-- Card preview + save -->
					<div class="card-section fade-in d5">
						<span class="section-tag">— Y O U R &nbsp; C A R D —</span>
						<div class="card-preview" style="background:{dog.cardColor}" bind:this={cardRef}>
							<img class="card-img" src="/dogs/dog-{dog.id}.png" alt={dog.name} />
							<span class="card-name">{dog.name}</span>
							<span class="card-mbti">{dog.mbti}</span>
							<p class="card-quip">"{isZh ? dog.quipZh : dog.quip}"</p>
							<div class="card-foot">
								<span>punkgo.ai</span>
								<span>What's your AI vibe?</span>
							</div>
						</div>
						<button class="btn-primary" onclick={saveCard}>💾 {isZh ? '保存卡片' : 'Save Card'}</button>
					</div>

					<!-- Extension upsell: compact inline -->
					<div class="ext-inline fade-in d5">
						<span>{isZh ? '这只是 5 道题的结果。想要真实数据？' : 'This was just 5 questions. Want real data?'}</span>
						<a href="https://github.com/PunkGo/punkgo-roast-extension" target="_blank">
							{isZh ? '安装 Chrome 扩展 →' : 'Install Extension →'}
						</a>
					</div>

					<a href="/quiz" class="retake fade-in d5">{isZh ? '不是你？重新测试 →' : 'Not you? Retake →'}</a>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.result-page {
		min-height: calc(100vh - 56px);
		display: flex;
		justify-content: center;
	}
	.center-col {
		width: 100%;
		max-width: 560px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 24px;
	}

	/* All phases share same centered block */
	.phase-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 16px;
		padding: 48px 0;
		width: 100%;
		min-height: calc(100vh - 56px);
		justify-content: center;
	}
	.phase-block.revealed {
		justify-content: flex-start;
		min-height: auto;
		padding-bottom: 64px;
	}

	/* Loading */
	.paw-ring {
		width: 100px; height: 100px;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border-accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 40px;
		animation: gentle-pulse 2s ease-in-out infinite;
	}
	.sub { font-size: 14px; color: var(--color-text-secondary); }
	.progress-bar { width: 180px; height: 3px; border-radius: var(--radius-full); background: var(--color-border); overflow: hidden; }
	.progress-fill { height: 100%; background: var(--color-cta); animation: loadProgress 2.5s ease-in-out forwards; }
	@keyframes loadProgress { 0% { width: 0; } 80% { width: 70%; } 100% { width: 95%; } }
	.fun-fact { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 12px; }
	.fun-fact p { font-size: 12px; color: var(--color-text-tertiary); max-width: 340px; }
	@keyframes gentle-pulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(90, 140, 106, 0.15); }
		50% { box-shadow: 0 0 0 10px rgba(90, 140, 106, 0); }
	}

	/* Card back + flip */
	.flip-card { width: 240px; height: 320px; perspective: 1200px; }
	.card-back-face {
		width: 100%; height: 100%;
		border-radius: var(--radius-xl);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 12px;
		border: 2px solid var(--color-border-accent);
		animation: gentle-pulse 2s ease-in-out infinite;
	}
	.flipping .card-back-face { animation: flip-away 600ms ease-in forwards; }
	.cb-paw { font-size: 36px; opacity: 0.5; }
	.cb-text { font-size: 14px; font-weight: 600; color: var(--color-text-secondary); }
	.revealing { font-size: 13px; color: var(--color-text-tertiary); animation: pulse-opacity 1.5s ease-in-out infinite; }
	@keyframes flip-away { 0% { transform: rotateY(0); } 100% { transform: rotateY(90deg); opacity: 0; } }
	@keyframes pulse-opacity { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

	/* Revealed */
	.avatar { width: 120px; height: 120px; border-radius: var(--radius-full); border: 2px solid var(--color-border-accent); object-fit: cover; }
	h1 { font-size: 28px; font-weight: 700; letter-spacing: 0.03em; margin: 0; }
	h2 { font-size: 20px; font-weight: 700; margin: 0; }
	.meta { display: flex; align-items: center; gap: 8px; }
	.mbti-badge {
		font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
		padding: 3px 10px; border-radius: var(--radius-sm);
		background: var(--color-bg-muted); border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.breed { font-size: 12px; color: var(--color-text-tertiary); }
	.quip { font-size: 18px; font-weight: 600; font-style: italic; line-height: 1.5; max-width: 440px; min-height: 54px; }
	.cursor { animation: blink 0.8s step-end infinite; font-style: normal; color: var(--color-cta); }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	.catch { font-size: 13px; color: var(--color-text-secondary); font-style: italic; }

	/* Share pills */
	.share-row { display: flex; gap: 8px; padding-top: 8px; }
	.share-pill {
		width: 40px; height: 40px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 14px; font-weight: 600;
		display: flex; align-items: center; justify-content: center;
		transition: border-color 150ms ease, transform 150ms ease;
	}
	.share-pill:hover { border-color: var(--color-border-accent); transform: translateY(-2px); }

	/* Card section */
	.card-section {
		display: flex; flex-direction: column; align-items: center;
		gap: 12px; padding-top: 24px; width: 100%;
	}
	.card-preview {
		width: 240px; height: 320px; border-radius: var(--radius-lg);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 8px;
		padding: 20px; border: 1px solid var(--color-border-accent);
	}
	.card-img { width: 48px; height: 48px; border-radius: var(--radius-full); object-fit: cover; }
	.card-name { font-size: 12px; font-weight: 700; color: #3A2518; letter-spacing: 0.05em; }
	.card-mbti { font-size: 9px; font-weight: 700; color: #5A8C6A; letter-spacing: 0.15em; }
	.card-quip { font-size: 10px; font-weight: 600; font-style: italic; text-align: center; color: #3A2518; line-height: 1.4; max-width: 200px; }
	.card-foot { display: flex; justify-content: space-between; width: 100%; }
	.card-foot span { font-size: 8px; color: #8B7060; }

	.btn-primary {
		padding: 10px 24px; border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 13px; font-weight: 700;
		transition: transform 150ms ease;
	}
	.btn-primary:hover { transform: translateY(-1px); }

	/* Extension inline */
	.ext-inline {
		display: flex; align-items: center; gap: 6px;
		font-size: 12px; color: var(--color-text-tertiary);
		padding-top: 20px;
	}
	.ext-inline a { color: var(--color-cta); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }

	.retake { font-size: 12px; color: var(--color-text-tertiary); padding-top: 8px; }

	/* Fade-in */
	.fade-in { animation: fadeInUp 0.5s ease-out both; }
	.d1 { animation-delay: 0.1s; }
	.d2 { animation-delay: 0.2s; }
	.d3 { animation-delay: 0.4s; }
	.d4 { animation-delay: 0.8s; }
	.d5 { animation-delay: 1.0s; }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

	@media (max-width: 639px) {
		h1 { font-size: 24px; }
		.quip { font-size: 16px; }
		.avatar { width: 100px; height: 100px; }
	}

	@media (prefers-reduced-motion: reduce) {
		.paw-ring, .card-back-face { animation: none; }
		.flipping .card-back-face { animation: none; }
		.revealing { animation: none; opacity: 1; }
		.fade-in { animation: none; opacity: 1; }
		.cursor { animation: none; }
		.progress-fill { animation: none; width: 70%; }
	}
</style>
