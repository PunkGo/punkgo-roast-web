<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { formatRecoveryCode } from '$lib/utils/recovery-code';

	let code: string = $state('');
	let error: string = $state('');
	let loading: boolean = $state(false);
	let isZh: boolean = $state(true);

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		code = formatRecoveryCode(target.value).slice(0, 14);
	}

	const isValid = $derived(code.length === 14);

	async function recover() {
		if (!isValid || loading) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/kennel/recover', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});
			if (!res.ok) throw new Error('not found');
			const data = await res.json();
			await goto('/k/' + data.kennelId);
		} catch {
			error = isZh ? '未找到，请检查恢复码' : 'Not found. Check your code.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{isZh ? '找回狗窝' : 'Recover Your Kennel'} — PunkGo Roast</title>
</svelte:head>

<div class="recover-page">
	<span class="section-tag">— R E C O V E R —</span>
	<h1>{isZh ? '找回狗窝' : 'Recover Your Kennel'}</h1>
	<p class="subtitle">{isZh ? '输入恢复码，找回你的狗窝' : 'Enter your recovery code to reclaim your kennel'}</p>

	<input
		class="code-input"
		type="text"
		value={code}
		oninput={handleInput}
		placeholder="XXXX-XXXX-XXXX"
		maxlength="14"
		autocomplete="off"
		spellcheck="false"
	/>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	<button class="btn-recover" disabled={!isValid || loading} onclick={recover}>
		{loading ? '...' : (isZh ? '找回狗窝' : 'Recover')}
	</button>
</div>

<style>
	.recover-page {
		max-width: 400px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-md) 64px;
		text-align: center;
	}
	h1 {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 700;
		margin: var(--space-sm) 0;
	}
	.subtitle {
		color: var(--color-text-secondary);
		font-size: 14px;
		margin-bottom: var(--space-lg);
	}
	.code-input {
		width: 100%;
		padding: 14px 16px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 18px;
		font-family: monospace;
		text-align: center;
		letter-spacing: 0.15em;
		background: var(--color-bg-card);
		text-transform: uppercase;
		margin-bottom: var(--space-md);
	}
	.code-input:focus {
		outline: none;
		border-color: var(--color-cta);
	}
	.code-input::placeholder {
		letter-spacing: 0.15em;
		color: var(--color-text-tertiary);
	}
	.error {
		color: var(--color-error, #e53e3e);
		font-size: 14px;
		margin-bottom: var(--space-md);
	}
	.btn-recover {
		padding: 12px 28px;
		background: var(--color-cta);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-size: var(--font-size-md);
		font-weight: 600;
		cursor: pointer;
		min-height: 44px;
		transition: background 0.2s;
		width: 100%;
	}
	.btn-recover:hover:not(:disabled) {
		background: var(--color-cta-hover);
	}
	.btn-recover:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
