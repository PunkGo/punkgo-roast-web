<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const allDogs = ['philosopher','architect','intern','commander','rereader','caretaker','perfectionist','mentor','vampire','drifter','goldfish','helper','brute','ghost','speedrunner','googler'];

	let isZh = $state(true);
	let myKennels: { id: string; dogId: string }[] = $state([]);
	let recoveryCode = $state('');
	let recovering = $state(false);
	let recoverError = $state('');

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		const cookies = document.cookie.split(';').map(c => c.trim());
		const kennels: { id: string; dogId: string }[] = [];
		for (const c of cookies) {
			const m = c.match(/^punkgo_k_([a-z0-9]{8})=(.+)$/);
			if (m && m[2] !== '') {
				const dogId = m[2];
				if (dogId !== '1' && allDogs.includes(dogId)) {
					kennels.push({ id: m[1], dogId });
				} else {
					kennels.push({ id: m[1], dogId: '' });
				}
			}
		}
		myKennels = kennels;
	});

	async function recover() {
		const code = recoveryCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
		if (code.length !== 12) {
			recoverError = isZh ? '请输入 12 位恢复码' : 'Enter your 12-character code';
			return;
		}
		recovering = true;
		recoverError = '';
		try {
			const res = await fetch(`/api/kennel/verify?code=${code}`);
			const data = await res.json();
			if (!res.ok || !data.kennel) {
				recoverError = isZh ? '恢复码无效' : 'Invalid recovery code';
				return;
			}
			goto(`/k/${data.kennel.id}/web`);
		} catch {
			recoverError = isZh ? '网络错误' : 'Network error';
		} finally {
			recovering = false;
		}
	}
</script>

<svelte:head>
	<title>{isZh ? '我的狗窝' : 'My Kennels'} — PunkGo Roast</title>
</svelte:head>

<div class="page">
	<span class="section-tag">— K E N N E L S —</span>
	<h1>{isZh ? '我的狗窝' : 'My Kennels'}</h1>

	{#if myKennels.length > 0}
		<div class="kennel-grid">
			{#each myKennels as k}
				<a href="/k/{k.id}/web" class="kennel-card">
					{#if k.dogId}
						<img src="/dogs/thumb/felt-{k.dogId}-nobg.png" alt={k.dogId} class="kennel-img" />
					{:else}
						<div class="kennel-paw">🐾</div>
					{/if}
					<span class="kennel-id">{k.id}</span>
				</a>
			{/each}
		</div>
	{:else}
		<p class="empty">{isZh ? '还没有狗窝，去测一个吧' : 'No kennels yet. Take the quiz!'}</p>
		<a href="/quiz" class="cta">{isZh ? '来，测一个 🐾' : "Let's Find Out 🐾"}</a>
	{/if}

	<div class="recover-section">
		<h2>{isZh ? '恢复码找回' : 'Recover with Code'}</h2>
		<p class="recover-hint">{isZh ? '输入狗证上的 12 位恢复码' : 'Enter the 12-character code from your dog license'}</p>
		<div class="recover-form">
			<input
				type="text"
				bind:value={recoveryCode}
				placeholder="XXXX-XXXX-XXXX"
				maxlength="14"
				onkeydown={(e) => e.key === 'Enter' && recover()}
			/>
			<button onclick={recover} disabled={recovering}>
				{recovering ? '...' : (isZh ? '找回' : 'Recover')}
			</button>
		</div>
		{#if recoverError}
			<p class="error">{recoverError}</p>
		{/if}
	</div>
</div>

<style>
	.page {
		max-width: 520px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md) var(--space-3xl);
		text-align: center;
	}
	.section-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.3em; color: var(--color-text-tertiary); }
	h1 { font-size: var(--font-size-xl); font-weight: 700; margin: var(--space-sm) 0 var(--space-lg); }

	.kennel-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}
	.kennel-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		background: var(--color-bg-card);
		border: 1.5px solid var(--color-border);
		text-decoration: none;
		transition: transform 150ms, border-color 150ms;
	}
	.kennel-card:hover { transform: translateY(-2px); border-color: var(--color-cta); }
	.kennel-img { width: 56px; height: 56px; border-radius: var(--radius-md); object-fit: contain; }
	.kennel-paw { font-size: 36px; }
	.kennel-id { font-size: 11px; font-weight: 600; color: var(--color-text-secondary); letter-spacing: 0.05em; }

	.empty { font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-md); }
	.cta {
		display: inline-flex; align-items: center; justify-content: center;
		padding: 12px 32px; border-radius: var(--radius-full);
		background: var(--color-cta); color: white;
		font-size: var(--font-size-md); font-weight: 700;
		margin-bottom: var(--space-xl);
	}

	.recover-section {
		padding-top: var(--space-xl);
		border-top: 1px solid var(--color-border);
	}
	h2 { font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-xs); }
	.recover-hint { font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-md); }
	.recover-form { display: flex; gap: var(--space-sm); max-width: 320px; margin: 0 auto; }
	.recover-form input {
		flex: 1; padding: 10px 12px;
		border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
		font-size: var(--font-size-sm); font-weight: 600;
		text-align: center; letter-spacing: 0.1em;
		background: var(--color-bg-card); font-family: inherit;
	}
	.recover-form input:focus { outline: none; border-color: var(--color-cta); }
	.recover-form button {
		padding: 10px 20px; border-radius: var(--radius-md);
		background: var(--color-bg-dark); color: var(--color-text-on-dark);
		border: none; font-size: var(--font-size-sm); font-weight: 600;
		cursor: pointer; font-family: inherit;
	}
	.recover-form button:disabled { opacity: 0.5; }
	.error { font-size: var(--font-size-sm); color: #C75050; margin-top: var(--space-sm); }
</style>
