<script lang="ts">
	import { onMount } from 'svelte';
	import { getDogByMBTI, type Dog } from '$lib/data/dogs';
	import QuizCard from '$lib/components/QuizCard.svelte';

	let { data } = $props();
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const share = $derived(data.share);
	const dog: Dog | null = $derived(share ? getDogByMBTI(share.mbti) : null);

	// 5 random dogs for the mini preview (exclude current dog)
	const allDogIds = ['philosopher','architect','intern','commander','rereader','caretaker','perfectionist','mentor','vampire','drifter','goldfish','helper','brute','ghost','speedrunner','googler'];
	const previewDogs = $derived(
		allDogIds.filter(id => id !== share?.personality_id).slice(0, 5)
	);
</script>

<svelte:head>
	{#if share}
		<title>TA 的 AI 是{share.personality_name_zh || share.personality_name} | PunkGo Roast</title>
		<meta property="og:title" content={`TA 的 AI 是${share.personality_name_zh || share.personality_name}`} />
		<meta property="og:description" content={`${share.quipZh || share.quip || share.catchphrase} — 来测测你的 AI 是什么性格 🐾`} />
		<meta property="og:image" content={`https://n78.xyz/api/v1/roast/share/${share.id}/card.png`} />
		<meta property="og:url" content={`https://roast.punkgo.ai/s/${share.id}`} />
		<meta name="twitter:card" content="summary_large_image" />
	{:else}
		<title>PunkGo Roast — What's Your AI Vibe?</title>
	{/if}
</svelte:head>

{#if share && dog}
	<div class="share-page">
		<div class="share-body">
			<div class="their-result">
				<span class="section-tag">{isZh ? '— TA 的 结 果 —' : '— T H E I R &nbsp; R E S U L T —'}</span>
				<h1 class="their-name">{isZh ? (share.personality_name_zh || share.personality_name) : share.personality_name}</h1>
				<div class="card-wrap">
					<QuizCard {dog} locale={isZh ? 'zh' : 'en'} aiName="AI" />
				</div>
			</div>
			<div class="cta-side">
				<span class="section-tag">— Y O U R &nbsp; T U R N —</span>
				<h2>{isZh ? "来测测你的 AI\n是什么性格" : "What's YOUR\nAI personality?"}</h2>
				<p class="cta-sub">{isZh ? '十六种狗子\n你的 AI 是哪一只？' : 'Sixteen breeds.\nWhich one is your AI?'}</p>
				<a href="/quiz" class="cta-btn">{isZh ? '来测测你的 AI 是什么性格' : 'Test your AI'}</a>
				<div class="mini-dogs">
					{#each previewDogs as dogId}
						<img class="mini-avatar" src="/dogs/felt-{dogId}-nobg.png" alt={dogId} />
					{/each}
					<div class="mini-dot more">+11</div>
				</div>
				<span class="free-note">{isZh ? '免费 · 60 秒 · 无需登录' : 'Free · 60 seconds · No login'}</span>
			</div>
		</div>
	</div>
{:else}
	<div class="not-found">
		<span class="section-tag">— N O T &nbsp; F O U N D —</span>
		<h1>{isZh ? '这个结果不存在' : "This result doesn't exist"}</h1>
		<p>{isZh ? '来创建你自己的吧！' : 'Make your own!'}</p>
		<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
	</div>
{/if}

<style>
	.share-page { min-height: calc(100vh - 56px); }
	.share-body { display: flex; min-height: calc(100vh - 56px); }
	.their-result {
		flex: 1;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 16px; padding: 48px 40px; text-align: center;
	}
	.their-name { font-size: 28px; font-weight: 700; margin: 0; }
	.card-wrap { margin: 8px 0; }
	.cta-side {
		width: 480px;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		gap: 20px; padding: 48px; background: var(--color-bg-muted); text-align: center;
	}
	.cta-side h2 { font-size: 36px; font-weight: 700; line-height: 1.1; white-space: pre-line; }
	.cta-sub { font-size: 15px; color: var(--color-text-secondary); line-height: 1.5; white-space: pre-line; }
	.cta-btn {
		display: inline-flex; align-items: center; justify-content: center;
		padding: 12px 32px; border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 14px; font-weight: 700; letter-spacing: 0.05em;
	}
	.cta-btn:hover { background: var(--color-cta-hover); }
	.mini-dogs { display: flex; gap: 8px; align-items: center; }
	.mini-avatar {
		width: 36px; height: 36px; border-radius: var(--radius-full);
		object-fit: cover; border: 1px solid var(--color-border);
		background: var(--color-bg-card);
	}
	.mini-dot.more {
		width: 36px; height: 36px; border-radius: var(--radius-full);
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		display: flex; align-items: center; justify-content: center;
		font-size: 10px; font-weight: 600; color: var(--color-text-secondary);
	}
	.free-note { font-size: 12px; color: var(--color-text-tertiary); }

	.not-found {
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		min-height: calc(100vh - 56px); gap: 16px; text-align: center;
	}
	.not-found h1 { font-size: 28px; }
	.not-found p { color: var(--color-text-secondary); }

	@media (max-width: 768px) {
		.share-body { flex-direction: column; }
		.their-result { padding: 32px 20px; }
		.cta-side { width: 100%; padding: 32px 20px; }
		.cta-side h2 { font-size: 28px; }
	}
</style>
