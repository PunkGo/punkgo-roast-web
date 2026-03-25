<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });
</script>

<svelte:head>
	<title>{isZh ? 'PunkGo Roast — 你的 AI 是什么 Vibe？' : "PunkGo Roast — What's Your AI Vibe?"}</title>
	<meta property="og:title" content="What's Your AI Vibe?" />
	<meta property="og:description" content="Five questions. Sixteen breeds. A whimsical examination of your AI personality." />
</svelte:head>

<div class="landing">
	<section class="hero">
		<div class="badge">
			<span class="badge-dot"></span>
			<span>{isZh ? '本周 3,847 人发现了自己的 vibe' : '3,847 vibes discovered this week'}</span>
		</div>
		<span class="section-tag">{isZh ? '— 一 次 性 格 测 试 —' : '— A  P E R S O N A L I T Y  E X A M I N A T I O N —'}</span>
		<h1>{isZh ? "你的 AI\n是什么 Vibe?" : "What's Your\nAI Vibe?"}</h1>
		<p class="subtitle">
			{isZh
				? '五道题。十六个犬种。六十秒。\n一次关于你的 AI 人格的奇妙测试。'
				: 'Five questions. Sixteen breeds. Sixty seconds.\nA whimsical examination of your artificial intelligence personality.'}
		</p>
		<div class="dog-preview">
			{#each ['#E0EFDA','#FFE0EC','#D0D4DC','#FFF0C8','#D0E0F4'] as color}
				<div class="dog-dot" style="background:{color}"></div>
			{/each}
			<div class="dog-dot more">+11</div>
		</div>
		<a href="/quiz" class="cta-btn">
			{isZh ? '开始测试' : 'Begin Examination'}
		</a>
		<p class="trust">{isZh ? '免费 · 无需注册 · 零数据收集' : 'Complimentary · No Registration · Zero Data Collected'}</p>
	</section>

	<section class="ext-promo">
		<div class="ext-left">
			<span class="section-tag">— F O R &nbsp; T H E &nbsp; S E R I O U S —</span>
			<h2>{isZh ? 'Quiz 只是开胃菜。\n真实数据才是正菜。' : "The quiz is fun.\nYour real data is scary accurate."}</h2>
			<p>
				{isZh
					? '安装 Chrome 扩展，分析你真实的 AI 聊天记录。\n100% 本地处理。支持 ChatGPT · DeepSeek · Kimi · 豆包。'
					: 'Install the Chrome extension to analyze your actual AI chat history.\n100% local. Works with ChatGPT · DeepSeek · Kimi · Doubao.'}
			</p>
			<a href="https://github.com/PunkGo/punkgo-roast-extension" target="_blank" class="ext-cta">
				🧩 {isZh ? '安装扩展' : 'Install Extension'}
			</a>
		</div>
		<div class="ext-right">
			<div class="store-card">
				<strong>Chrome Web Store</strong>
				<span>★★★★★ · Free · 100% Local</span>
			</div>
			<span class="ext-also">{isZh ? '同时支持 Edge 浏览器' : 'Also available on Edge Add-ons'}</span>
		</div>
	</section>
</div>

<style>
	.landing { display: flex; flex-direction: column; }
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 56px);
		gap: 24px;
		padding: 0 48px;
		text-align: center;
	}
	.badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 18px;
		border-radius: var(--radius-full);
		background: var(--color-bg-muted);
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.badge-dot {
		width: 6px; height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-cta);
	}
	h1 {
		font-size: 60px;
		font-weight: 700;
		line-height: 1.05;
		white-space: pre-line;
		max-width: 700px;
	}
	.subtitle {
		font-size: 16px;
		color: var(--color-text-secondary);
		line-height: 1.6;
		white-space: pre-line;
		max-width: 560px;
	}
	.dog-preview { display: flex; gap: 14px; padding: 8px 0; }
	.dog-dot { width: 72px; height: 72px; border-radius: var(--radius-xl); }
	.dog-dot.more {
		background: var(--color-bg-muted);
		display: flex; align-items: center; justify-content: center;
		font-size: 14px; font-weight: 600; color: var(--color-text-secondary);
	}
	.cta-btn {
		display: inline-flex; align-items: center; justify-content: center;
		width: 240px; height: 52px;
		border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
		transition: background 150ms ease, transform 150ms ease;
	}
	.cta-btn:hover { background: var(--color-cta-hover); transform: translateY(-1px); }
	.trust {
		font-size: 14px; font-weight: 500;
		color: var(--color-text-secondary); letter-spacing: 0.05em;
	}
	.ext-promo { display: flex; border-top: 1px solid var(--color-border); }
	.ext-left {
		flex: 1; display: flex; flex-direction: column; justify-content: center;
		gap: 12px; padding: 48px; background: var(--color-bg-muted);
	}
	.ext-left h2 { font-size: 24px; font-weight: 700; line-height: 1.2; white-space: pre-line; }
	.ext-left p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; white-space: pre-line; }
	.ext-cta {
		display: inline-flex; align-items: center; justify-content: center;
		width: 200px; height: 44px;
		border-radius: var(--radius-md);
		background: var(--color-bg-dark); color: var(--color-text-on-dark);
		font-size: 13px; font-weight: 700; gap: 6px;
	}
	.ext-right {
		width: 480px; display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 8px; padding: 48px; background: #E8E0D4;
	}
	.store-card {
		display: flex; flex-direction: column; align-items: center;
		gap: 8px; padding: 24px 48px;
		background: var(--color-bg-card); border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-accent);
	}
	.store-card strong { font-size: 14px; }
	.store-card span { font-size: 12px; color: var(--color-text-secondary); }
	.ext-also { font-size: 11px; color: var(--color-text-tertiary); }

	@media (max-width: 639px) {
		h1 { font-size: 36px; }
		.hero { padding: 0 20px; }
		.dog-dot { width: 48px; height: 48px; }
		.ext-promo { flex-direction: column; }
		.ext-right { width: 100%; }
	}
</style>
