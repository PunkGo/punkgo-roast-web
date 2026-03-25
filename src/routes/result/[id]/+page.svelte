<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { decodeResultId, getDogByMBTI, type Dog } from '$lib/data/dogs';

	let isZh = $state(false);
	let dog: Dog | null = $state(null);
	let resultId = $state('');

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		resultId = $page.params.id;
		try {
			const mbti = decodeResultId(resultId);
			dog = getDogByMBTI(mbti);
		} catch {
			dog = null;
		}
	});

	$effect(() => {
		resultId = $page.params.id;
	});

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
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		});
	}

	function saveCard() {
		// TODO: generate PNG card via canvas or server endpoint
		// For now, open the card SVG URL
		const url = `https://roast.punkgo.ai/s/${resultId}`;
		navigator.clipboard.writeText(url);
		alert(isZh ? '卡片功能开发中，链接已复制！' : 'Card download coming soon. Link copied!');
	}
</script>

<svelte:head>
	<title>{dog ? `${dog.name} — PunkGo Roast` : 'Result — PunkGo Roast'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="reveal-page">
	{#if dog}
		<div class="reveal-body">
			<div class="quip-side">
				<span class="section-tag">— Y O U R &nbsp; R E S U L T —</span>
				<div class="avatar" style="background:{dog.cardColor || '#EDE5D8'}"></div>
				<h1>{dog.name}</h1>
				<div class="mbti-badge">{dog.mbti}</div>
				<p class="quip">"{isZh ? dog.quipZh : dog.quip}"</p>
				<p class="catch">— {isZh ? dog.catchphraseZh : dog.catchphrase}</p>
				<div class="actions">
					<button class="btn-x" onclick={shareToX}>𝕏 Share</button>
					<button class="btn-weibo" onclick={shareToWeibo}>微博</button>
					<button class="btn-wa" onclick={shareToWhatsApp}>WhatsApp</button>
					<button class="btn-save" onclick={saveCard}>Save Card</button>
					<button class="btn-copy" onclick={copyLink}>{copied ? (isZh ? '已复制!' : 'Copied!') : 'Copy Link'}</button>
				</div>
			</div>
			<div class="card-side">
				<div class="card-preview" style="background:{dog.cardColor || '#E0EFDA'}">
					<span class="card-name">{dog.name}</span>
					<span class="card-mbti">{dog.mbti}</span>
					<p class="card-quip">"{isZh ? dog.quipZh : dog.quip}"</p>
					<div class="card-footer">
						<span>punkgo.ai</span>
						<span>What's your AI vibe?</span>
					</div>
				</div>
				<a href="/quiz" class="retake">{isZh ? '不是你？重新测试 →' : 'Not you? Retake →'}</a>
			</div>
		</div>

		<div class="ext-upsell">
			<div class="ext-left">
				<span class="section-tag">— W A N T &nbsp; S C A R Y &nbsp; A C C U R A C Y ? —</span>
				<h3>{isZh ? '这只是基于 5 道题。\n想象你的真实 AI 数据能揭示什么。' : "This was based on 5 questions.\nImagine what your real AI data reveals."}</h3>
				<p>{isZh ? '扩展分析你真实的聊天记录 — 100% 本地，零数据外传。' : 'The extension analyzes your actual chat history — 100% local, zero data leaves your device.'}</p>
			</div>
			<a href="https://github.com/PunkGo/punkgo-roast-extension" target="_blank" class="ext-btn">🧩 {isZh ? '安装扩展' : 'Get Extension'}</a>
		</div>
	{:else}
		<div class="placeholder">
			<span class="section-tag">— L O A D I N G —</span>
			<p>{isZh ? '加载结果中...' : 'Loading result...'}</p>
			<a href="/quiz" class="cta-btn">{isZh ? '或重新开始' : 'Or start fresh'}</a>
		</div>
	{/if}
</div>

<style>
	.reveal-page { min-height: calc(100vh - 56px); display: flex; flex-direction: column; }
	.reveal-body { display: flex; flex: 1; }
	.quip-side {
		flex: 1; display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 16px; padding: 48px 64px; text-align: center;
	}
	.avatar { width: 160px; height: 160px; border-radius: var(--radius-full); border: 2px solid var(--color-border-accent); }
	.quip-side h1 { font-size: 32px; font-weight: 700; letter-spacing: 0.05em; }
	.mbti-badge {
		font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
		padding: 4px 14px; border-radius: var(--radius-sm);
		background: var(--color-bg-muted); border: 1px solid var(--color-border-accent);
		color: var(--color-text-secondary);
	}
	.quip { font-size: 20px; font-weight: 600; font-style: italic; line-height: 1.5; max-width: 460px; }
	.catch { font-size: 14px; color: var(--color-text-secondary); font-style: italic; }

	.actions { display: flex; gap: 10px; padding-top: 12px; flex-wrap: wrap; justify-content: center; }
	.actions button {
		padding: 10px 18px; border-radius: var(--radius-md);
		font-size: 12px; font-weight: 600;
	}
	.btn-x { background: #1A1A1A; color: white; }
	.btn-weibo { background: #E6162D; color: white; }
	.btn-wa { background: #25D366; color: white; }
	.btn-save { background: var(--color-cta); color: white; }
	.btn-copy { background: var(--color-bg-muted); color: var(--color-text-secondary); }

	.card-side {
		width: 480px; background: var(--color-bg-muted);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 20px; padding: 40px;
	}
	.card-preview {
		width: 300px; height: 400px; border-radius: var(--radius-lg);
		display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: 12px;
		padding: 24px; border: 1px solid var(--color-border-accent);
	}
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

	@media (max-width: 768px) {
		.reveal-body { flex-direction: column; }
		.card-side { width: 100%; }
		.ext-upsell { flex-direction: column; text-align: center; }
	}
</style>
