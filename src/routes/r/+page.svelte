<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { analyzeLMLPA, getAIName } from '$lib/data/ai-quiz-prompt';
	import { getDogByMBTI, encodeMBTI } from '$lib/data/dogs';

	const answer = decodeURIComponent($page.url.searchParams.get('a') || '');
	const aiId = $page.url.searchParams.get('ai') || 'other';
	const method = $page.url.searchParams.get('m') || 'lmlpa';
	const sessionId = $page.url.searchParams.get('id') || '';
	const aiName = getAIName(aiId);

	let status: 'analyzing' | 'done' | 'error' = $state('analyzing');
	const isZh = typeof navigator !== 'undefined' && navigator.language.startsWith('zh');
	let mbti = '';
	let dogId = '';

	if (!answer || answer.length < 10) {
		status = 'error';
	} else {
		// Analyze the response
		mbti = analyzeLMLPA(answer);
		const dog = getDogByMBTI(mbti);
		dogId = dog.id;

		const resultId = encodeMBTI(mbti, aiId);

		// Redirect to result page with all data
		status = 'done';

		// Use sessionStorage to pass the analysis data
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('roast-result', JSON.stringify({
				personality: dog,
				quip: dog.quipZh,
				catchphrase: dog.catchphraseZh,
				resultId,
				mbti,
				aiName,
				method,
				answer,
			}));
		}

		// Redirect
		if (typeof window !== 'undefined') {
			goto(`/result/${resultId}?ai=${aiId}`);
		}
	}
</script>

<div class="callback-page">
	{#if status === 'analyzing'}
		<p>{isZh ? `正在分析 ${aiName} 的性格...` : `Analyzing ${aiName}'s personality...`}</p>
	{:else if status === 'error'}
		<h1>{isZh ? '回答内容不足' : 'Not enough answers'}</h1>
		<p>{isZh ? '没有收到有效的 AI 回答。请重新测试。' : 'No valid AI response received. Please try again.'}</p>
		<a href="/quiz" class="btn-primary">{isZh ? '重新开始 🐾' : 'Start over 🐾'}</a>
	{:else}
		<p>{isZh ? '跳转中...' : 'Redirecting...'}</p>
	{/if}
</div>

<style>
	.callback-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		text-align: center;
		padding: var(--space-lg);
	}
	h1 { font-size: var(--font-size-xl); margin-bottom: var(--space-md); }
	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: var(--font-size-md);
		font-weight: 600;
		text-decoration: none;
		margin-top: var(--space-md);
	}
</style>
