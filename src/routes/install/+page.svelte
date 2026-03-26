<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);
	let installMethod: 'store' | 'offline' = $state('store');

	const STORE_URL = 'https://chromewebstore.google.com/detail/punkgo-roast/efnfbhkndociaflfahkgagbfpggijkfe';
	const OFFLINE_URL = '/punkgo-roast-latest.zip';

	onMount(() => { isZh = navigator.language.startsWith('zh'); });
</script>

<svelte:head>
	<title>{isZh ? '安装指南 — PunkGo Roast' : 'Install Guide — PunkGo Roast'}</title>
	<meta name="description" content={isZh ? '3 步安装 PunkGo Roast 浏览器扩展，支持 ChatGPT/DeepSeek/Kimi/豆包' : 'Install PunkGo Roast in 3 steps. Supports ChatGPT, DeepSeek, Kimi & Doubao.'} />
</svelte:head>

<div class="install-page">
	<header class="hero">
		<span class="section-tag">— {isZh ? '解锁完整画像' : 'U N L O C K'} —</span>
		<h1>{isZh ? '你的 AI 是什么 vibe？' : "What's your AI vibe?"}</h1>
		<p class="sub">{isZh
			? 'Quiz 只能猜你是哪只狗。扩展分析你真实的 AI 聊天行为，三步搞定，一次 AI 的存在主义危机。'
			: 'The quiz guesses which dog you are. The extension analyzes your real AI chat behavior. Three clicks. One existential crisis for your AI.'}</p>
	</header>

	<!-- What you get -->
	<section class="compare">
		<div class="compare-item quiz-side">
			<span class="compare-label">{isZh ? 'Quiz 版' : 'Quiz'}</span>
			<ul>
				<li>✅ {isZh ? '可爱犬种卡片' : 'Cute dog card'}</li>
				<li>✅ {isZh ? '毒舌金句' : 'Roast quip'}</li>
				<li class="missing">❌ {isZh ? '无雷达图' : 'No radar chart'}</li>
				<li class="missing">❌ {isZh ? '无行为分析' : 'No behavior analysis'}</li>
			</ul>
		</div>
		<div class="compare-item ext-side">
			<span class="compare-label">{isZh ? 'Extension 版' : 'Extension'}</span>
			<ul>
				<li>✅ {isZh ? '16 种犬种人格 + 独特插画' : '16 dog personalities + unique art'}</li>
				<li>✅ {isZh ? '6 维迷因雷达图' : '6-axis meme radar chart'}</li>
				<li>✅ {isZh ? '翻牌动画揭晓' : 'Card flip reveal animation'}</li>
				<li>✅ {isZh ? '一键分享短链接' : 'One-click share via link'}</li>
			</ul>
			<span class="free-badge">{isZh ? '免费 · 开源' : 'Free · Open Source'}</span>
		</div>
	</section>

	<!-- Supported platforms -->
	<section class="platforms">
		<h2>{isZh ? '支持平台' : 'Supported Platforms'}</h2>
		<div class="platform-grid">
			<div class="platform">
				<svg class="p-logo" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
				<span class="p-name">ChatGPT</span>
			</div>
			<div class="platform">
				<svg class="p-logo deepseek" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 8.5 11 8.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm5.5-4.5c0 .28-.03.55-.08.82l2.22 1.28c.17-.65.26-1.34.26-2.05 0-3.87-2.83-7.08-6.53-7.68v2.56c2.32.55 4.05 2.62 4.05 5.12z"/></svg>
				<span class="p-name">DeepSeek</span>
			</div>
			<div class="platform">
				<svg class="p-logo kimi" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="2" fill="#fff"/><circle cx="15" cy="10" r="2" fill="#fff"/><path d="M8 15c0 0 2 3 4 3s4-3 4-3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
				<span class="p-name">Kimi</span>
			</div>
			<div class="platform">
				<svg class="p-logo doubao" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14c-2.76 0-5-1.12-5-2.5 0-1.38 2.24-2.5 5-2.5s5 1.12 5 2.5c0 1.38-2.24 2.5-5 2.5z"/></svg>
				<span class="p-name">{isZh ? '豆包' : 'Doubao'}</span>
			</div>
		</div>
	</section>

	<!-- Install method toggle -->
	<section class="method-toggle">
		<button class="toggle-btn" class:active={installMethod === 'store'} onclick={() => installMethod = 'store'}>
			{isZh ? '🛒 商店安装' : '🛒 Store Install'}
		</button>
		<button class="toggle-btn" class:active={installMethod === 'offline'} onclick={() => installMethod = 'offline'}>
			{isZh ? '📦 离线安装' : '📦 Offline Install'}
		</button>
	</section>

	<!-- 3 steps -->
	<section class="steps">
		<h2>{installMethod === 'store'
			? (isZh ? '3 步商店安装' : '3 Steps — Store Install')
			: (isZh ? '3 步离线安装' : '3 Steps — Offline Install')}</h2>

		{#if installMethod === 'store'}
		<!-- === STORE INSTALL === -->
		<div class="step">
			<div class="step-num">1</div>
			<div class="step-content">
				<h3>{isZh ? '前往商店' : 'Visit the Store'}</h3>
				<p>{isZh
					? '点击下方按钮，打开 Chrome 网上应用商店（Edge 浏览器也可以安装 Chrome 扩展）。'
					: 'Click the button below to open the Chrome Web Store. Edge browser can also install Chrome extensions.'}</p>
				<a href={STORE_URL} target="_blank" rel="noopener" class="install-btn">
					{isZh ? '🛒 前往 Chrome 商店' : '🛒 Open Chrome Web Store'}
				</a>
				<div class="tip">
					💡 {isZh
						? 'Edge 用户：打开链接后，页面顶部会提示「允许来自其他商店的扩展」，点击允许即可。'
						: 'Edge users: A banner will appear saying "Allow extensions from other stores". Click Allow.'}
				</div>
			</div>
		</div>

		<div class="step">
			<div class="step-num">2</div>
			<div class="step-content">
				<h3>{isZh ? '点击「添加到 Chrome」' : 'Click "Add to Chrome"'}</h3>
				<p>{isZh
					? '在商店页面点击蓝色的「添加到 Chrome」按钮。弹窗中点击「添加扩展程序」确认安装。'
					: 'Click the blue "Add to Chrome" button on the store page. Confirm by clicking "Add extension" in the popup.'}</p>
				<div class="tip">
					🐕 {isZh
						? '安装成功后，浏览器右上角工具栏会出现 PunkGo 图标。'
						: 'After install, the PunkGo icon appears in your browser toolbar (top-right).'}
				</div>
			</div>
		</div>

		<div class="step">
			<div class="step-num">3</div>
			<div class="step-content">
				<h3>{isZh ? '打开 AI 聊天，点击扩展' : 'Open your AI chat, click the extension'}</h3>
				<p>{isZh
					? '打开 ChatGPT / DeepSeek / Kimi / 豆包 任意一个平台，点击工具栏的 PunkGo 图标，即可获得你的 AI 人格卡片。'
					: 'Open ChatGPT / DeepSeek / Kimi / Doubao, click the PunkGo icon in your toolbar, and get your AI personality card.'}</p>
				<p class="highlight">{isZh
					? '犬种 · 迷因雷达 · 附赠一段你没要求的毒舌点评。'
					: 'Dog breed. Meme radar. And a roast you didn\'t ask for.'}</p>
			</div>
		</div>

		{:else}
		<!-- === OFFLINE INSTALL === -->
		<div class="step">
			<div class="step-num">1</div>
			<div class="step-content">
				<h3>{isZh ? '下载安装包' : 'Download the Package'}</h3>
				<p>{isZh
					? '点击下方按钮下载扩展安装包（.zip 文件，约 130KB），然后解压到任意文件夹。'
					: 'Click below to download the extension package (.zip, ~130KB). Unzip it to any folder.'}</p>
				<a href={OFFLINE_URL} download class="install-btn">
					{isZh ? '📦 下载安装包 (130KB)' : '📦 Download Package (130KB)'}
				</a>
				<div class="tip">
					💡 {isZh
						? '记住解压后的文件夹位置，下一步要用到。'
						: 'Remember where you unzipped it — you\'ll need the folder path next.'}
				</div>
			</div>
		</div>

		<div class="step">
			<div class="step-num">2</div>
			<div class="step-content">
				<h3>{isZh ? '打开扩展管理页' : 'Open Extensions Page'}</h3>
				<p>{isZh
					? '在浏览器地址栏输入以下地址并回车：'
					: 'Type this URL in your browser address bar and press Enter:'}</p>
				<div class="code-block">
					<code>chrome://extensions</code>
				</div>
				<p>{isZh
					? '然后打开右上角的「开发者模式」开关。'
					: 'Then turn on the "Developer mode" toggle in the top-right corner.'}</p>
				<div class="tip">
					💡 {isZh
						? 'Edge 浏览器输入 edge://extensions，操作完全一样。'
						: 'For Edge browser, use edge://extensions — same steps.'}
				</div>
			</div>
		</div>

		<div class="step">
			<div class="step-num">3</div>
			<div class="step-content">
				<h3>{isZh ? '加载解压的扩展' : 'Load the Extension'}</h3>
				<p>{isZh
					? '点击页面左上角的「加载已解压的扩展程序」按钮，选择刚才解压出来的文件夹。'
					: 'Click "Load unpacked" button (top-left), then select the folder you unzipped.'}</p>
				<div class="tip">
					🐕 {isZh
						? '加载成功后，工具栏出现 PunkGo 图标。打开 ChatGPT/DeepSeek/Kimi/豆包，点击图标即可使用！'
						: 'Once loaded, the PunkGo icon appears in your toolbar. Open ChatGPT/DeepSeek/Kimi/Doubao and click it!'}
				</div>
				<div class="tip" style="margin-top:8px">
					⚠️ {isZh
						? '离线安装的扩展不会自动更新。有新版本时回到本页重新下载即可。'
						: 'Offline-installed extensions don\'t auto-update. Come back here to download new versions.'}
				</div>
			</div>
		</div>
		{/if}
	</section>

	<!-- Privacy -->
	<section class="privacy">
		<h2>🔒 {isZh ? '隐私第一——这次是认真的' : 'Privacy First — No, really'}</h2>
		<div class="privacy-grid">
			<div class="priv-item">
				<span class="priv-icon">🚫</span>
				<span>{isZh ? '不读取聊天内容' : 'Never reads your chats'}</span>
			</div>
			<div class="priv-item">
				<span class="priv-icon">💻</span>
				<span>{isZh ? '100% 本地分析' : '100% local analysis'}</span>
			</div>
			<div class="priv-item">
				<span class="priv-icon">☁️</span>
				<span>{isZh ? '零数据上传' : 'Zero data upload'}</span>
			</div>
			<div class="priv-item">
				<span class="priv-icon">📖</span>
				<span>{isZh ? '开源代码 (MIT)' : 'Open source (MIT)'}</span>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="faq">
		<h2>{isZh ? '常见问题' : 'FAQ'}</h2>

		<details>
			<summary>{isZh ? '它真的不会看我的聊天记录吗？' : 'Does it really not read my chats?'}</summary>
			<p>{isZh
				? '真的不会。扩展只统计行为模式（消息数量、平均长度、使用时段等），完全不读取对话文字内容。所有数据在浏览器本地处理，唯一发到服务器的是你主动生成分享卡片时的人格结果——不含任何聊天内容。代码开源可审计。'
				: 'Really. The extension only counts behavioral patterns (message count, length, timing). It never reads message content. All processing is local. The only server request is when you choose to generate a share card — and that contains zero chat content. Code is open source for audit.'}</p>
		</details>

		<details>
			<summary>{isZh ? 'Edge 浏览器可以用吗？' : 'Can I use it on Edge?'}</summary>
			<p>{isZh
				? '可以。Edge 支持安装 Chrome 扩展。打开 Chrome 商店链接后，页面会提示允许安装，点击确认即可。Edge 专属版本正在审核中。'
				: 'Yes. Edge supports Chrome extensions. When you open the Chrome Web Store link, Edge will prompt you to allow installation. An Edge-native version is under review.'}</p>
		</details>

		<details>
			<summary>{isZh ? '支持哪些 AI 平台？' : 'Which AI platforms are supported?'}</summary>
			<p>{isZh
				? 'ChatGPT、DeepSeek、Kimi、豆包 (Doubao)。更多平台持续添加中。'
				: 'ChatGPT, DeepSeek, Kimi, and Doubao. More platforms coming soon.'}</p>
		</details>

		<details>
			<summary>{isZh ? '免费吗？' : 'Is it free?'}</summary>
			<p>{isZh ? '完全免费，永久免费，开源 (MIT)。' : 'Completely free, forever. Open source (MIT).'}</p>
		</details>
	</section>

	<div class="bottom-cta">
		<a href={STORE_URL} target="_blank" rel="noopener" class="install-btn large">
			{isZh ? '立即安装（免费）' : 'Install Now (Free)'}
		</a>
		<a href="/quiz" class="back-link">{isZh ? '← 先做 Quiz 试试' : '← Take the Quiz first'}</a>
	</div>
</div>

<style>
	.install-page { max-width: 680px; margin: 0 auto; padding: 0 24px 64px; }

	.hero {
		text-align: center; padding: 40px 0 32px;
		display: flex; flex-direction: column; align-items: center; gap: 12px;
	}
	.hero h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
	.sub { font-size: 15px; color: var(--color-text-secondary); line-height: 1.6; max-width: 520px; }

	/* Method toggle */
	.method-toggle {
		display: flex; gap: 8px; justify-content: center; margin-bottom: 24px;
	}
	.toggle-btn {
		padding: 10px 20px; border-radius: 100px; min-height: 44px;
		font-size: 13px; font-weight: 600;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		color: var(--color-text-secondary); cursor: pointer;
		transition: all 150ms ease;
	}
	.toggle-btn.active {
		background: var(--color-cta); color: white; border-color: var(--color-cta);
	}
	.toggle-btn:hover:not(.active) { background: var(--color-bg-muted); }

	.code-block {
		margin: 8px 0; padding: 10px 16px; border-radius: 8px;
		background: #2A1F18; color: #E8E0D4;
		font-family: 'SF Mono', 'Consolas', monospace; font-size: 14px;
		user-select: all;
	}

	/* Compare */
	.compare { display: flex; gap: 16px; margin-bottom: 40px; }
	.compare-item {
		flex: 1; padding: 20px; border-radius: 16px;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
	}
	.ext-side {
		border-color: var(--color-cta);
		background: linear-gradient(135deg, #EDF7F0 0%, #F5F0E8 100%);
		position: relative;
	}
	.compare-label { font-size: 13px; font-weight: 700; display: block; margin-bottom: 12px; }
	.compare-item ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
	.compare-item li { font-size: 13px; color: var(--color-text-secondary); }
	.missing { opacity: 0.5; }
	.free-badge {
		position: absolute; top: -10px; right: 16px;
		background: var(--color-cta); color: white;
		font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px;
	}

	/* Platforms */
	.platforms { margin-bottom: 40px; }
	.platforms h2 { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 16px; }
	.platform-grid { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
	.platform {
		display: flex; flex-direction: column; align-items: center; gap: 6px;
		padding: 16px 24px; border-radius: 12px;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		min-width: 100px;
	}
	.p-logo { width: 32px; height: 32px; }
	.p-logo { color: #10A37F; } /* ChatGPT green */
	.p-logo.deepseek { color: #4D6BFE; }
	.p-logo.kimi { color: #000000; }
	.p-logo.doubao { color: #3370FF; }
	.p-name { font-size: 12px; font-weight: 600; color: var(--color-text); }

	/* Steps */
	.steps { margin-bottom: 40px; }
	.steps h2 { font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center; }
	.step {
		display: flex; gap: 16px; margin-bottom: 16px; padding: 20px;
		border-radius: 16px; background: var(--color-bg-card); border: 1px solid var(--color-border);
	}
	.step-num {
		width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
		background: var(--color-cta); color: white;
		font-size: 16px; font-weight: 700;
		display: flex; align-items: center; justify-content: center;
	}
	.step-content { flex: 1; }
	.step-content h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
	.step-content p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }
	.highlight { font-weight: 600; color: var(--color-text); font-style: italic; margin-top: 8px; }
	.tip {
		margin-top: 10px; padding: 10px 14px; border-radius: 8px;
		background: var(--color-bg-muted); font-size: 12px; color: var(--color-text-secondary); line-height: 1.5;
	}
	.install-btn {
		display: inline-flex; align-items: center; justify-content: center; gap: 8px;
		margin-top: 12px; padding: 12px 24px;
		background: var(--color-cta); color: white;
		border-radius: 12px; font-size: 14px; font-weight: 700; min-height: 44px;
		transition: transform 150ms ease;
	}
	.install-btn:hover { transform: translateY(-1px); }
	.install-btn.large { font-size: 16px; padding: 16px 36px; }

	/* Privacy */
	.privacy { margin-bottom: 40px; }
	.privacy h2 { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 16px; }
	.privacy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.priv-item {
		display: flex; align-items: center; gap: 10px;
		padding: 14px 16px; border-radius: 12px;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		font-size: 13px; font-weight: 500; color: var(--color-text);
	}
	.priv-icon { font-size: 20px; }

	/* FAQ */
	.faq { margin-bottom: 48px; }
	.faq h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; text-align: center; }
	details {
		border: 1px solid var(--color-border); border-radius: 12px;
		margin-bottom: 8px; overflow: hidden;
	}
	summary {
		padding: 14px 16px; font-size: 14px; font-weight: 600;
		cursor: pointer; min-height: 44px; display: flex; align-items: center;
	}
	summary:hover { background: var(--color-bg-muted); }
	details p { padding: 0 16px 14px; font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }

	.bottom-cta {
		text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
	}
	.back-link { font-size: 13px; color: var(--color-text-secondary); }

	@media (max-width: 639px) {
		.compare { flex-direction: column; }
		.platform-grid { flex-wrap: wrap; }
		.privacy-grid { grid-template-columns: 1fr; }
		.hero h1 { font-size: 22px; }
	}
</style>
