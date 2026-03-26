<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { analyzeLMLPA, getAIName } from '$lib/data/ai-quiz-prompt';
	import { getDogByMBTI, encodeResultId } from '$lib/data/dogs';

	const answer = decodeURIComponent($page.url.searchParams.get('a') || '');
	const aiId = $page.url.searchParams.get('ai') || 'other';
	const method = $page.url.searchParams.get('m') || 'lmlpa';
	const sessionId = $page.url.searchParams.get('id') || '';
	const aiName = getAIName(aiId);

	let status: 'analyzing' | 'done' | 'error' = $state('analyzing');
	let mbti = '';
	let dogId = '';

	if (!answer || answer.length < 10) {
		status = 'error';
	} else {
		// Analyze the response
		mbti = analyzeLMLPA(answer);
		const dog = getDogByMBTI(mbti);
		dogId = dog.id;

		// Build a fake answer array for encodeResultId compatibility
		const fakeAnswers = mbti.split('').map((_, i) => ({ question: i + 1, choice: 'A' }));
		const resultId = encodeResultId(fakeAnswers);

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
		<p>正在分析 {aiName} 的性格...</p>
	{:else if status === 'error'}
		<h1>回答内容不足</h1>
		<p>没有收到有效的 AI 回答。请重新测试。</p>
		<a href="/quiz" class="btn-primary">重新开始 🐾</a>
	{:else}
		<p>跳转中...</p>
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
	h1 { font-size: 24px; margin-bottom: var(--space-md); }
	.btn-primary {
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
		margin-top: var(--space-md);
	}
</style>
