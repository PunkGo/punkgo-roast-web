<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import confetti from 'canvas-confetti';
	import { decodeResultId, getDogByMBTI, type Dog } from '$lib/data/dogs';
	import { getAIName } from '$lib/data/ai-quiz-prompt';
	import { copyToClipboard } from '$lib/utils/copy';
	import QuizCard from '$lib/components/QuizCard.svelte';
	import AdoptModal from '$lib/components/AdoptModal.svelte';

	let isZh = $state(false);
	let dog: Dog | null = $state(null);
	let resultId = $state('');
	let llmQuip: string | null = $state(null);
	let llmIntro: string | null = $state(null);

	// Get AI name and quiz quip from URL query params
	const aiParam = $page.url.searchParams.get('ai') || 'AI';
	const aiName = typeof aiParam === 'string' && aiParam !== 'AI' ? getAIName(aiParam) : 'AI';
	const quizQuip = $page.url.searchParams.get('quip') || null;

	const funFacts = [
		{ en: 'The average person says "thank you" to AI 3.7 times per session', zh: '平均每个人每次对话会对 AI 说 3.7 次"谢谢"' },
		{ en: '47% of AI users have chatted with AI past midnight', zh: '47% 的 AI 用户在午夜后还在跟 AI 聊天' },
		{ en: 'ENTJ users write the longest prompts on average', zh: 'ENTJ 用户平均写最长的 prompt' },
		{ en: 'INFP users are most likely to apologize to AI', zh: 'INFP 用户最可能跟 AI 道歉' },
	];

	let initialized = $state(false);
	let phase: 'loading' | 'card-back' | 'flipping' | 'revealed' = $state('loading');
	let typedQuip = $state('');
	let showActions = $state(false);
	let loadingFact = $state(funFacts[0]);
	let copied = $state(false);
	let adopting = $state(false);
	let adoptedKennelId = $state('');
	let showAdoptModal = $state(false);

	onMount(async () => {
		isZh = navigator.language.startsWith('zh');
		resultId = $page.params.id ?? '';
		loadingFact = funFacts[Math.floor(Math.random() * funFacts.length)];

		try {
			const mbti = decodeResultId(resultId);
			dog = getDogByMBTI(mbti);
		} catch { dog = null; }

		const existing = sessionStorage.getItem('punkgo_adopted_' + resultId);
		if (existing) adoptedKennelId = existing;

		initialized = true;

		if (dog) {
			const locale = isZh ? 'zh' : 'en';
			const t0 = performance.now();

			// If quiz provided the owner-intro answer, use it as quip
			// Only fetch DeepSeek for the intro phrase
			let quip: string | null = quizQuip;
			try {
				const ctrl = new AbortController();
				const timeout = setTimeout(() => ctrl.abort(), 8000);
				const introOnly = quizQuip ? '&intro_only=1' : '';
				const res = await fetch(`/api/generate-quip?id=${resultId}&locale=${locale}${introOnly}`, { signal: ctrl.signal });
				const data = await res.json();
				clearTimeout(timeout);
				if (!quizQuip) quip = data.quip || null;
				llmIntro = data.intro || null;
			} catch {
			}

			// Ensure minimum 2.5s loading animation
			const elapsed = performance.now() - t0;
			if (elapsed < 2500) {
				await new Promise(r => setTimeout(r, 2500 - elapsed));
			}

			llmQuip = quip;
			phase = 'revealed';
			fireConfetti();
			typewriterQuip(quip || (isZh ? dog.quipZh : dog.quip));
			setTimeout(() => { showActions = true; }, 1500);
		}

	});

	$effect(() => { resultId = $page.params.id ?? ''; });

	async function adoptDog() {
		if (adopting || !dog) return;
		adopting = true;
		try {
			const res = await fetch('/api/kennel/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					resultId,
					mbti: dog.mbti,
					aiType: aiParam || 'unknown',
					dogId: dog.id,
					quip: llmIntro && llmQuip ? `${llmIntro}|${llmQuip}` : llmQuip || (isZh ? dog.quipZh : dog.quip),
					locale: isZh ? 'zh' : 'en',
				}),
			});
			const data = await res.json();
			if (res.ok) {
				sessionStorage.setItem('punkgo_recovery', data.recoveryCode);
				sessionStorage.setItem('punkgo_adopted_' + resultId, data.kennelId);
				window.location.href = '/k/' + data.kennelId + '/web?new=1';
			}
		} catch {} finally {
			adopting = false;
		}
	}

	function fireConfetti() {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const colors = ['#5A8C6A', '#C4956A', '#D4B896', '#8060A0', '#C75050'];
		confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors, gravity: 1.2 });
		setTimeout(() => {
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.3, x: 0.3 }, colors });
			confetti({ particleCount: 40, spread: 100, origin: { y: 0.3, x: 0.7 }, colors });
		}, 200);
	}

	let cursorVisible = $state(true);

	function typewriterQuip(text?: string) {
		if (!dog) return;
		const full = text || llmQuip || (isZh ? dog.quipZh : dog.quip);
		let i = 0;
		const interval = setInterval(() => {
			typedQuip = full.slice(0, i + 1);
			i++;
			if (i >= full.length) {
				clearInterval(interval);
				setTimeout(() => { cursorVisible = false; }, 2000);
			}
		}, 35);
	}

	function getShareText(): string {
		if (!dog) return '';
		const name = isZh ? dog.nameZh : dog.name;
		return isZh
			? `我的${aiName}居然是${name}！来测测你的AI是什么性格 🐾`
			: `My ${aiName} is a ${name}! Find out your AI's personality 🐾`;
	}

	function shareToX() {
		if (!dog) return;
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(url)}`, '_blank');
	}
	function shareToWeibo() {
		if (!dog) return;
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(url)}`, '_blank');
	}
	function shareToWhatsApp() {
		if (!dog) return;
		window.open(`https://wa.me/?text=${encodeURIComponent(getShareText() + ' https://roast.punkgo.ai/s/' + resultId)}`, '_blank');
	}
	function copyLink() {
		copyToClipboard(`https://roast.punkgo.ai/s/${resultId}`).then(() => {
			copied = true; setTimeout(() => { copied = false; }, 2000);
		});
	}
	let quizCardComponent: QuizCard = $state(null as any);

	async function saveCard() {
		try {
			await quizCardComponent?.saveAsPng();
		} catch {
			copyToClipboard(`https://roast.punkgo.ai/s/${resultId}`);
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
		{#if !initialized}
			<!-- Wait for onMount before showing anything -->
			<div class="phase-block">
				<div class="paw-ring">🐾</div>
			</div>

		{:else if !dog}
			<div class="phase-block">
				<span class="section-tag">— N O T &nbsp; F O U N D —</span>
				<h2>{isZh ? '这个结果不存在' : "This result doesn't exist"}</h2>
				<a href="/quiz" class="btn-primary">{isZh ? '开始测试' : 'Begin Examination'}</a>
			</div>

		{:else if phase === 'loading'}
			<div class="phase-block">
				<span class="section-tag">— A N A L Y Z I N G —</span>
				<div class="paw-ring" style="background:{dog.cardColor}">🐾</div>
				<h2>{isZh ? `正在检测你的 ${aiName} 的性格...` : `Examining your ${aiName}'s personality...`}</h2>
				<p class="sub">{isZh ? '在十六只狗子中匹配...' : 'Matching with one of sixteen dogs...'}</p>
				<div class="progress-bar"><div class="progress-fill"></div></div>
				<div class="fun-fact">
					<span class="section-tag">— D I D &nbsp; Y O U &nbsp; K N O W ? —</span>
					<p>{isZh ? loadingFact.zh : loadingFact.en}</p>
				</div>
			</div>

		{:else}
			<!-- Revealed: compact, two cards top-aligned -->
			<div class="phase-block revealed">
				<span class="section-tag fade-in">— Y O U R &nbsp; R E S U L T —</span>
				<h1 class="fade-in d1">{isZh ? dog.nameZh : dog.name}</h1>

				{#if showActions}
				<div class="cards-row fade-in d2">
					<div class="card-col">
						<QuizCard {dog} locale={isZh ? 'zh' : 'en'} {aiName} customQuip={llmQuip} customIntro={llmIntro} bind:this={quizCardComponent} />
						<div class="card-actions">
							<button class="btn-primary" onclick={saveCard} title={isZh ? '保存卡片' : 'Save Card'}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
							</button>
							<div class="share-row">
								<button class="share-pill" onclick={shareToX} title="X">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
								</button>
								<button class="share-pill" onclick={shareToWeibo} title="微博">
									<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M407 218c-6-17-22-26-35-21s-19 21-13 38c3 8 3 17-1 25-5 13-15 23-27 28-6 2-9 7-8 13 1 6 7 10 13 9 22-7 39-25 46-47 5-14 5-30 1-45zm-35 76c-4-1-6-2-4-7 4-10 5-18 0-25-8-11-30-11-55 0 0 0-8 3-6-3-4-12-3-23 3-33 13-22 46-35 82-24 36 11 46 37 40 51-2 6-12 18-21 16l-39-25zm-162 64c-69 7-129-24-134-69s48-87 117-94c69-7 129 24 134 69s-48 87-117 94zM218 154c-103 10-183 67-178 128s92 104 195 94 183-67 178-128-92-104-195-94zm192-70c-15-42-57-64-100-51s-66 56-50 97c4 10 13 16 23 13s16-13 12-23c-8-21 3-45 25-51s45 5 52 26c8 22-2 45-24 52-10 3-16 14-12 24s14 16 24 12c42-14 65-57 50-99z"/></svg>
								</button>
								<button class="share-pill" onclick={shareToWhatsApp} title="WhatsApp">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
								</button>
								<button class="share-pill" onclick={copyLink} title={isZh ? '复制链接' : 'Copy Link'}>
									{#if copied}
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
									{:else}
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
									{/if}
								</button>
							</div>
						</div>
					</div>
					<!-- radar-locked hidden for v2, /install page kept -->
				<!-- Adopt action -->
				<div class="card-col">
					{#if adoptedKennelId}
						<a href="/k/{adoptedKennelId}/web" class="adopt-btn adopted">
							🏠 {isZh ? '进入狗窝' : 'Enter Kennel'}
						</a>
					{:else}
						<button class="adopt-btn" onclick={() => { showAdoptModal = true; }}>
							🐾 {isZh ? '领养这只狗' : 'Adopt this dog'}
						</button>
					{/if}
				</div>
				</div><!-- /cards-row -->

				<a href="/quiz" class="retake fade-in d5">{isZh ? '换个 AI 再测 →' : 'Test another AI →'}</a>
				{/if}
			</div><!-- /phase-block -->
		{/if}
	</div>
</div>

{#if showAdoptModal && dog}
	<AdoptModal
		{dog}
		locale={isZh ? 'zh' : 'en'}
		{aiName}
		quip={llmQuip || (isZh ? dog.quipZh : dog.quip)}
		intro={llmIntro || (isZh ? '它这样介绍你' : 'About its owner')}
		onComplete={(nick, kid, rc) => {
			showAdoptModal = false;
			adoptedKennelId = kid;
			sessionStorage.setItem('punkgo_adopted_' + resultId, kid);
			window.location.href = '/k/' + kid + '/web?new=1';
		}}
		onClose={() => { showAdoptModal = false; }}
	/>
{/if}

{#if adopting}
	<div class="adopting-overlay" style="display:none">
		<div class="adopting-content">
			<span class="adopting-paw">🐾</span>
			<p>{isZh ? '正在制作狗卡...' : 'Creating your dog card...'}</p>
		</div>
	</div>
{/if}

<style>
	.result-page {
		min-height: calc(100vh - 56px);
		display: flex;
		justify-content: center;
	}
	.center-col {
		width: 100%;
		max-width: 860px;
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
		gap: var(--space-md);
		padding: 48px 0;
		width: 100%;
		min-height: calc(100vh - 56px);
		justify-content: center;
	}
	.phase-block.revealed {
		justify-content: center;
		min-height: auto;
		padding: 32px 0 64px;
	}

	/* Two cards row */

	/* Loading */
	.paw-ring {
		width: 100px; height: 100px;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border-accent);
		display: flex; align-items: center; justify-content: center;
		font-size: var(--font-size-3xl);
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
	.revealing { font-size: var(--font-size-sm); color: var(--color-text-tertiary); animation: pulse-opacity 1.5s ease-in-out infinite; }
	@keyframes flip-away { 0% { transform: rotateY(0); } 100% { transform: rotateY(90deg); opacity: 0; } }
	@keyframes pulse-opacity { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

	/* Revealed */
	.avatar { width: 120px; height: 120px; border-radius: var(--radius-full); border: 2px solid var(--color-border-accent); object-fit: cover; }
	h1 { font-size: 28px; font-weight: 700; letter-spacing: 0.03em; margin: 0; }
	h2 { font-size: var(--font-size-lg); font-weight: 700; margin: 0; }
	.meta { display: flex; align-items: center; gap: var(--space-sm); }
	.mbti-badge {
		font-size: var(--font-size-xs); font-weight: 600; letter-spacing: 0.1em;
		padding: 3px 10px; border-radius: var(--radius-sm);
		background: var(--color-bg-muted); border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.breed { font-size: 12px; color: var(--color-text-tertiary); }
	.quip { font-size: 18px; font-weight: 600; font-style: italic; line-height: 1.5; max-width: 440px; min-height: 54px; }
	.cursor { animation: blink 0.8s step-end infinite; font-style: normal; color: var(--color-cta); }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	.catch { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-style: italic; }

	/* Share pills */
	.share-row { display: flex; gap: var(--space-sm); padding-top: var(--space-sm); }
	.share-pill {
		width: 44px; height: 44px;
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
		gap: 12px; padding-top: var(--space-lg); width: 100%;
	}
	/* Two cards side by side, top-aligned */
	.cards-row {
		display: flex; gap: var(--space-lg); justify-content: center;
		align-items: flex-start;
		padding-top: var(--space-md);
	}
	.card-col { display: flex; flex-direction: column; align-items: center; gap: 10px; }
	.card-actions { display: flex; align-items: center; gap: var(--space-sm); }
	.card-actions .btn-primary {
		width: 44px; height: 44px; padding: 0;
		display: flex; align-items: center; justify-content: center;
		border-radius: var(--radius-full);
	}

	.btn-primary {
		padding: 12px 28px; border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: var(--font-size-sm); font-weight: 700;
		min-height: 44px;
		transition: transform 150ms ease;
	}
	.btn-primary:hover { transform: translateY(-1px); }

	.retake { font-size: 12px; color: var(--color-text-tertiary); padding: 12px 0; min-height: 44px; display: flex; align-items: center; }

	/* Fade-in */
	.fade-in { animation: fadeInUp 0.5s ease-out both; }
	.d1 { animation-delay: 0.1s; }
	.d2 { animation-delay: 0.2s; }
	.d3 { animation-delay: 0.4s; }
	.d4 { animation-delay: 0.8s; }
	.d5 { animation-delay: 1.0s; }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

	@media (max-width: 768px) {
		.cards-row { flex-direction: column; align-items: center; }
		h1 { font-size: var(--font-size-xl); }
		.quip { font-size: var(--font-size-base); }
	}

	@media (prefers-reduced-motion: reduce) {
		.paw-ring, .card-back-face { animation: none; }
		.flipping .card-back-face { animation: none; }
		.revealing { animation: none; opacity: 1; }
		.fade-in { animation: none; opacity: 1; }
		.cursor { animation: none; }
		.progress-fill { animation: none; width: 70%; }
	}

	/* Locked dog card — beside QuizCard */
	.locked-card {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: transform 150ms ease;
	}
	.locked-card:hover { transform: translateY(-4px); }
	.locked-card:disabled { opacity: 0.6; cursor: not-allowed; }
	.locked-inner {
		width: 200px;
		height: 280px;
		border-radius: var(--radius-xl);
		border: 2.5px dashed var(--color-border-accent);
		background: var(--color-bg-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		position: relative;
		overflow: hidden;
	}
	.locked-icon {
		font-size: 28px;
		position: absolute;
		top: 16px;
		right: 16px;
		opacity: 0.6;
	}
	.locked-dog {
		width: 80px;
		height: 80px;
		object-fit: contain;
		opacity: 0.3;
		filter: grayscale(100%);
	}
	.locked-label {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-cta);
		text-align: center;
		white-space: pre-line;
		line-height: 1.4;
	}
	@media (max-width: 768px) {
		.locked-inner { width: 160px; height: 240px; }
		.locked-dog { width: 60px; height: 60px; }
		.locked-label { font-size: 12px; }
	}

	/* Adopting overlay */
	.adopting-overlay {
		position: fixed; inset: 0; z-index: 100;
		background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
		display: flex; align-items: center; justify-content: center;
	}
	.adopting-content {
		display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
		color: white; text-align: center;
	}
	.adopting-paw {
		font-size: 48px;
		animation: gentle-pulse 2s ease-in-out infinite;
	}
	.adopting-content p { font-size: var(--font-size-base); font-weight: 600; }

	/* Adopted card */
	.adopt-btn {
		display: flex; align-items: center; justify-content: center;
		width: 100%; max-width: 300px;
		padding: 16px 24px;
		background: #C08040; color: #fff;
		border: none; border-radius: 14px;
		font-size: var(--font-size-base); font-weight: 700;
		cursor: pointer; font-family: inherit;
		box-shadow: 0 4px 16px rgba(192, 128, 64, 0.3);
		transition: background 200ms ease, transform 200ms ease;
		text-decoration: none;
	}
	.adopt-btn:hover { background: #A06830; transform: translateY(-2px); }
	.adopt-btn.adopted {
		background: #5A8C6A; box-shadow: 0 4px 16px rgba(90, 140, 106, 0.3);
	}
	.adopt-btn.adopted:hover { background: #4A7A5A; }
	.adopted-card { text-decoration: none; }
	.adopted-inner {
		width: 200px; height: 280px;
		border-radius: var(--radius-xl);
		border: 2.5px solid var(--color-border-accent);
		background: var(--color-bg-card);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 12px; position: relative; overflow: hidden;
		transition: transform 150ms ease;
	}
	.adopted-inner:hover { transform: translateY(-4px); }
	.adopted-icon { font-size: 28px; position: absolute; top: 16px; right: 16px; }
	.adopted-label {
		font-size: 14px; font-weight: 700;
		color: var(--color-cta); text-align: center;
	}
	@media (max-width: 768px) {
		.adopted-inner { width: 160px; height: 240px; }
	}
</style>
