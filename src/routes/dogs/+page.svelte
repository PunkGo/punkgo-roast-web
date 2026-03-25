<script lang="ts">
	import { onMount } from 'svelte';
	let isZh = $state(false);
	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const dogs = [
		{ id: 'philosopher', name: 'Philosopher', nameZh: '哲学家', mbti: 'INTP', color: '#E0EFDA', accent: '#5A8C6A', quip: 'Overthinks everything.' },
		{ id: 'architect', name: 'Architect', nameZh: '建筑师', mbti: 'INTJ', color: '#D0D8C4', accent: '#5A6B50', quip: 'Has a system for systems.' },
		{ id: 'intern', name: 'Intern', nameZh: '实习生', mbti: 'ENFP', color: '#FFE0EC', accent: '#C75050', quip: 'Asks AI everything. Literally.' },
		{ id: 'commander', name: 'Commander', nameZh: '指挥官', mbti: 'ENTJ', color: '#E8D0D8', accent: '#6B5060', quip: 'Prompt engineering is a lifestyle.' },
		{ id: 'rereader', name: 'Rereader', nameZh: '复读机', mbti: 'ISTJ', color: '#FFE8D0', accent: '#C08040', quip: 'Read the docs. Then read them again.' },
		{ id: 'caretaker', name: 'Caretaker', nameZh: '保姆', mbti: 'ISFJ', color: '#F5E6D8', accent: '#8B7060', quip: 'Says please and thank you to AI.' },
		{ id: 'perfectionist', name: 'Perfectionist', nameZh: '完美主义者', mbti: 'INFJ', color: '#E8D8F0', accent: '#8060A0', quip: 'The prompt is never done.' },
		{ id: 'mentor', name: 'Mentor', nameZh: '导师', mbti: 'ENFJ', color: '#D8D0E8', accent: '#605080', quip: 'Teaches AI how to teach.' },
		{ id: 'vampire', name: 'Vampire', nameZh: '吸血鬼', mbti: 'ISTP', color: '#D0D4DC', accent: '#505868', quip: 'Only uses AI after midnight.' },
		{ id: 'drifter', name: 'Drifter', nameZh: '漂流者', mbti: 'ISFP', color: '#F0E8F8', accent: '#7060A0', quip: 'Vibes with AI. No agenda.' },
		{ id: 'goldfish', name: 'Goldfish', nameZh: '金鱼', mbti: 'ESFP', color: '#D8F0F4', accent: '#408090', quip: 'New chat every 3 messages.' },
		{ id: 'helper', name: 'Helper', nameZh: '热心人', mbti: 'ESFJ', color: '#E0F0D0', accent: '#508050', quip: 'Uses AI to help everyone else.' },
		{ id: 'brute', name: 'Brute', nameZh: '莽夫', mbti: 'ESTJ', color: '#F4D0C8', accent: '#B04040', quip: 'Types in all caps. AI obeys.' },
		{ id: 'ghost', name: 'Ghost', nameZh: '幽灵', mbti: 'INFP', color: '#E8E8E8', accent: '#808080', quip: 'Has 47 unsent drafts.' },
		{ id: 'speedrunner', name: 'Speedrunner', nameZh: '速通玩家', mbti: 'ESTP', color: '#FFF0C8', accent: '#B09030', quip: 'Fastest prompt in the west.' },
		{ id: 'googler', name: 'Googler', nameZh: '搜索怪', mbti: 'ENTP', color: '#D0E0F4', accent: '#4070B0', quip: 'Asked 47 questions. Read 0 answers.' },
	];
</script>

<svelte:head>
	<title>{isZh ? '十六犬种 — PunkGo Roast' : '16 Dogs — PunkGo Roast'}</title>
</svelte:head>

<div class="wall">
	<header>
		<span class="section-tag">— T H E &nbsp; C O L L E C T I O N —</span>
		<h1>{isZh ? '十六犬种。十六种 Vibe。' : 'Sixteen Dogs. Sixteen Vibes.'}</h1>
		<p>{isZh ? '每个 AI 用户都是其中之一。你是哪个？' : 'Every AI user is one of these personalities. Which one are you?'}</p>
	</header>
	<div class="grid">
		{#each dogs as dog}
			<div class="dog-card" style="background:{dog.color}">
				<img class="dog-avatar" src="/dogs/dog-{dog.id}.png" alt={dog.name} />
				<div class="dog-info">
					<span class="dog-name">{isZh ? dog.nameZh : dog.name}</span>
					<span class="dog-mbti" style="color:{dog.accent}">{dog.mbti}</span>
					<span class="dog-quip">{dog.quip}</span>
				</div>
			</div>
		{/each}
	</div>
	<div class="wall-cta">
		<a href="/quiz" class="cta-btn">{isZh ? '开始测试' : 'Begin Examination'}</a>
	</div>
</div>

<style>
	.wall { padding: 0 48px 64px; }
	header { text-align: center; padding: 32px 0 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
	header h1 { font-size: 32px; font-weight: 700; }
	header p { font-size: 15px; color: var(--color-text-secondary); }
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.dog-card {
		border-radius: var(--radius-lg);
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 100px;
	}
	.dog-avatar { width: 44px; height: 44px; border-radius: var(--radius-full); flex-shrink: 0; object-fit: cover; }
	.dog-info { display: flex; flex-direction: column; gap: 2px; }
	.dog-name { font-size: 14px; font-weight: 700; color: #3A2518; }
	.dog-mbti { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; }
	.dog-quip { font-size: 11px; color: #8B7060; }
	.wall-cta { text-align: center; padding-top: 32px; }
	.cta-btn {
		display: inline-flex; align-items: center; justify-content: center;
		padding: 12px 32px;
		border-radius: var(--radius-md);
		background: var(--color-cta); color: white;
		font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
	}

	@media (max-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
	@media (max-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } .wall { padding: 0 16px 48px; } }
</style>
