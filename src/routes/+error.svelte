<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });
</script>

<svelte:head>
	<title>{$page.status} — PunkGo Roast</title>
</svelte:head>

<div class="error-page">
	<span class="section-tag">— O O P S —</span>
	<span class="paw">🐾</span>
	<h1>{$page.status}</h1>
	<p class="msg">
		{#if $page.status === 404}
			{isZh ? '这只狗跑丢了...' : 'This dog ran away...'}
		{:else}
			{isZh ? '出了点问题' : 'Something went wrong'}
		{/if}
	</p>
	<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
	<a href="/" class="back-link">{isZh ? '← 返回首页' : '← Back to Home'}</a>
</div>

<style>
	.error-page {
		min-height: calc(100vh - 56px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		text-align: center;
		padding: var(--space-lg);
	}
	.paw { font-size: 48px; }
	h1 { font-size: 64px; font-weight: 700; color: var(--color-text); margin: 0; }
	.msg { font-size: 18px; color: var(--color-text-secondary); }
	.cta-btn {
		margin-top: var(--space-sm);
		padding: 14px 40px;
		background: var(--color-cta);
		color: white;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: 700;
	}
	.cta-btn:hover { transform: translateY(-1px); }
	.back-link { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
	.back-link:hover { color: var(--color-text); }
</style>
