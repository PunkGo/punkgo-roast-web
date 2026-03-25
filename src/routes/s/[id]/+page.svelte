<script lang="ts">
	import { onMount } from 'svelte';
	let { data } = $props();
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const share = data.share;
</script>

<svelte:head>
	{#if share}
		<title>{share.personality_name} — PunkGo Roast</title>
		<meta property="og:title" content={`I'm ${share.personality_name} — What's YOUR AI Vibe?`} />
		<meta property="og:description" content={share.quip || share.catchphrase || "Take the quiz to find your AI dog personality."} />
		<meta property="og:image" content={`https://n78.xyz/api/v1/roast/share/${share.id}/card.png`} />
		<meta property="og:url" content={`https://roast.punkgo.ai/s/${share.id}`} />
		<meta name="twitter:card" content="summary_large_image" />
	{:else}
		<title>PunkGo Roast — What's Your AI Vibe?</title>
	{/if}
</svelte:head>

{#if share}
	<div class="share-page">
		<div class="share-body">
			<div class="their-result">
				<span class="shared-tag">{isZh ? '有人分享了他们的结果' : 'Someone shared their result with you'}</span>
				<div class="their-avatar" style="background:{share.card_color || '#EDE5D8'}"></div>
				<h1>{share.personality_name_zh && isZh ? share.personality_name_zh : share.personality_name}</h1>
				<div class="mbti-tag">{share.mbti}</div>
				<p class="their-quip">"{share.quip || share.catchphrase}"</p>
			</div>
			<div class="cta-side">
				<span class="section-tag">— Y O U R &nbsp; T U R N —</span>
				<h2>{isZh ? "你的 AI\n是什么 Vibe？" : "What's YOUR\nAI Vibe?"}</h2>
				<p class="cta-sub">{isZh ? '五道题发现\n你是哪只狗。' : 'Five questions to discover\nwhich dog matches your style.'}</p>
				<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
				<div class="mini-dogs">
					{#each ['#E0EFDA','#FFE0EC','#D0D4DC','#FFF0C8','#D0E0F4'] as c}
						<div class="mini-dot" style="background:{c}"></div>
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
		gap: 16px; padding: 48px 60px; text-align: center;
	}
	.shared-tag {
		font-size: 11px; font-weight: 500; color: var(--color-text-secondary);
		padding: 4px 14px; border-radius: var(--radius-full); background: var(--color-bg-muted);
	}
	.their-avatar {
		width: 120px; height: 120px; border-radius: var(--radius-full);
		border: 2px solid var(--color-border-accent);
	}
	.their-result h1 { font-size: 28px; font-weight: 700; }
	.mbti-tag {
		font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
		color: var(--color-text-secondary); padding: 4px 14px;
		border-radius: var(--radius-sm); background: var(--color-bg-muted);
		border: 1px solid var(--color-border-accent);
	}
	.their-quip {
		font-size: 18px; font-weight: 600; font-style: italic; line-height: 1.5;
		max-width: 400px;
	}
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
	.mini-dogs { display: flex; gap: 8px; }
	.mini-dot { width: 36px; height: 36px; border-radius: var(--radius-full); }
	.mini-dot.more {
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
		.cta-side { width: 100%; }
	}
</style>
