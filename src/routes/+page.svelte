<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);

	const allDogs = ['philosopher','architect','intern','commander','rereader','caretaker','perfectionist','mentor','vampire','drifter','goldfish','helper','brute','ghost','speedrunner','googler'];
	let previewDogs = $state(allDogs.slice(0, 3));

	onMount(() => {
		isZh = navigator.language.startsWith('zh');
		const shuffled = [...allDogs].sort(() => Math.random() - 0.5);
		previewDogs = shuffled.slice(0, 3);
	});
</script>

<svelte:head>
	<title>{isZh ? 'PunkGo Roast — AI 互动实验' : 'PunkGo Roast — AI Interactive Experiments'}</title>
	<meta property="og:title" content="PunkGo Roast" />
	<meta property="og:description" content="AI personality quiz + AI mystery game. One URL, any AI." />
</svelte:head>

<div class="landing">
	<div class="hero-text">
		<span class="section-tag">— P U N K G O &nbsp; R O A S T —</span>
		<h1>{isZh ? '用一个链接，让 AI 做点好玩的' : 'One URL. Any AI. Something fun.'}</h1>
		<p class="hero-sub">{isZh
			? '基于 text/plain 协议——一个 URL 返回纯文本指令，任何 AI 读了就能执行。零安装，零 API key。'
			: 'Built on text/plain protocol — a URL returns plain text instructions that any AI can read and act on. Zero install. Zero API key.'}</p>
	</div>

	<div class="cards">
		<!-- Quiz Card (warm) -->
		<a href="/quiz" class="card card-quiz">
			<span class="card-tag">— A I &nbsp; V I B E &nbsp; C H E C K —</span>
			<div class="dog-grid">
				{#each previewDogs as id}
					<img src="/dogs/thumb/felt-{id}-nobg.png" alt={id} loading="lazy" />
				{/each}
			</div>
			<h2>{isZh ? '你的 AI 是什么 Vibe？' : "What's Your AI Vibe?"}</h2>
			<p class="card-sub">{isZh
				? '给 AI 发一段提示词，测出它的隐藏人格'
				: 'Send a prompt to your AI, discover its hidden personality'}</p>
			<p class="card-detail">{isZh ? '16 种犬种 · 性格卡 · 狗证 · 狗窝' : '16 breeds · personality card · dog license · kennel'}</p>
			<div class="card-cta">{isZh ? '来，测一个 🐾' : "Let's Find Out 🐾"}</div>
			<span class="card-meta">{isZh ? '免费 · 无需注册 · 5 分钟' : 'Free · No signup · 5 min'}</span>
		</a>

		<!-- Game Card (dark) -->
		<a href="/game" class="card card-game">
			<span class="card-tag">— A I &nbsp; M Y S T E R Y &nbsp; G A M E —</span>
			<img class="game-hero" src="/game/game_hero.jpg" alt="The Missing Room" loading="lazy" />
			<h2>{isZh ? '消失的房间' : 'The Missing Room'}</h2>
			<p class="card-sub">{isZh ? '一栋百年老宅，一间消失的房间' : 'A century-old mansion. A room that vanished.'}</p>
			<div class="card-cta">{isZh ? '开始调查 🏚️' : 'Investigate 🏚️'}</div>
			<span class="card-meta">{isZh ? '10 轮 · 3 结局 · ~15 分钟' : '10 rounds · 3 endings · ~15 min'}</span>
		</a>
	</div>
</div>

<style>
	.landing {
		min-height: calc(100vh - 56px);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-xl) var(--space-lg) var(--space-3xl);
	}

	.hero-text {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	h1 {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		line-height: 1.2;
		max-width: 500px;
		margin: var(--space-sm) auto 0;
	}
	.hero-sub {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		max-width: 480px;
		line-height: 1.6;
		margin-top: var(--space-xs);
	}

	.cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-lg);
		max-width: 840px;
		width: 100%;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-xl) var(--space-lg);
		border-radius: var(--radius-xl);
		text-decoration: none;
		transition: transform 200ms ease, box-shadow 200ms ease;
		gap: var(--space-sm);
	}
	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(58, 37, 24, 0.12);
	}

	/* Quiz card — warm */
	.card-quiz {
		background: var(--color-bg-card);
		border: 1.5px solid var(--color-border);
		color: var(--color-text);
	}
	.card-quiz .card-tag { color: var(--color-text-tertiary); }
	.card-quiz h2 { color: var(--color-text); }
	.card-quiz .card-sub { color: var(--color-text-secondary); }
	.card-quiz .card-cta {
		background: var(--color-cta);
		color: white;
	}
	.card-quiz .card-cta:hover { background: var(--color-cta-hover); }
	.card-quiz .card-meta { color: var(--color-text-tertiary); }

	/* Game card — dark */
	.card-game {
		background: #1a1510;
		border: 1.5px solid #3a3020;
		color: #e8dcc8;
	}
	.card-game .card-tag { color: #6a5a48; }
	.card-game h2 { color: #f0e8d8; }
	.card-game .card-sub { color: #a89878; }
	.card-game .card-cta {
		background: #c8a060;
		color: #1a1510;
	}
	.card-game .card-meta { color: #6a5a48; }

	/* Shared card elements */
	.card-tag {
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 0.3em;
	}

	.card h2 {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin: 0;
	}

	.card-sub {
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.card-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 32px;
		border-radius: var(--radius-full);
		font-size: var(--font-size-md);
		font-weight: 700;
		margin-top: var(--space-xs);
		transition: background 150ms ease;
	}

	.card-meta {
		font-size: var(--font-size-2xs);
	}

	/* Quiz dog grid */
	.dog-grid {
		display: flex;
		gap: 12px;
		padding: var(--space-sm) 0;
	}
	.dog-grid img {
		width: 72px;
		height: 72px;
		border-radius: var(--radius-lg);
		object-fit: cover;
	}

	.card-detail {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		letter-spacing: 0.02em;
	}
	.card-game .card-detail { color: #6a5a48; }

	/* Game hero image */
	.game-hero {
		width: 100%;
		border-radius: var(--radius-md);
		margin: var(--space-xs) 0;
	}

	/* Section tag */
	.section-tag {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.3em;
		color: var(--color-text-tertiary);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.cards {
			grid-template-columns: 1fr;
			max-width: 400px;
		}
		h1 { font-size: var(--font-size-lg); overflow-wrap: break-word; }
		.hero-sub { overflow-wrap: break-word; }
		.card { padding: var(--space-lg) var(--space-md); }
	}
</style>
