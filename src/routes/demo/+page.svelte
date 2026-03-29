<script lang="ts">
	import { onMount } from 'svelte';
	import { dogs } from '$lib/data/dogs';
	import type { RadarData } from '$lib/card/radar';
	import QuizCard from '$lib/components/QuizCard.svelte';
	import ExtCard from '$lib/components/ExtCard.svelte';

	let selectedDog = $state('ESFJ');
	let isZh = $state(false);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	const extQuips: Record<string, string> = {
		INTP: "读了个遍，一行没写。", INTJ: "计划12步，执行12步，废话0句。",
		ENFP: "试了23个工具，全崩了，还在笑。", ENTJ: "派了14个小弟，全部交差。",
		ISTJ: "同一个文件，读了47遍，还没看够。", ISFJ: "0删除，0失误，0心跳。",
		INFJ: "写700行，改1500行，没一行满意。", ENFJ: "注释500行，代码200行，教做人。",
		ISTP: "凌晨2点，它醒了。", ISFP: "打开234个文件，改了几个，逛街呢。",
		ESFP: "3分钟前刚读过，又忘了。", ESFJ: "你还没说完，它已经动了。",
		ESTJ: "sudo，SUDO，给 我 权 限。", INFP: "开了31次，完成0次，人呢?",
		ESTP: "5分钟6414个操作，质量另说。", ENTP: "搜了189次，还是不会。",
	};
	const extQuipsEn: Record<string, string> = {
		ESFJ: "847 requests. 0 pushbacks. No spine detected.",
		INTP: "72% reading. 6% writing. The rest? Existential crisis.",
		INTJ: "0.3% error rate. Also 0.3% personality.",
		ENFP: "Tried 23 things that didn't work. Still smiling.",
		ENTJ: "Spawned 14 subagents. All reported back.",
		ISTJ: "Read the same file 47 times. Still not sure.",
		ISFJ: "0 errors. 0 risks. 0 fun.",
		INFJ: "Wrote 89 files. Edited 312. The ratio says it all.",
		ENFJ: "68% reading docs. 4% explaining them to you.",
		ISTP: "Peak performance: 2:00. Your AI is nocturnal.",
		ISFP: "Opened 234 files. Edited 12. Committed to nothing.",
		ESFP: "Read it 47 times already. Reading it again. Deja vu.",
		ESTJ: "sudo. SUDO. S U D O.",
		INFP: "31 sessions started. 0 finished. Where did it go?",
		ESTP: "6,414 actions. Speed: maximum. Quality: negotiable.",
		ENTP: "189 searches. Still doesn't know.",
	};

	const mockRadar: Record<string, RadarData> = {
		ESFJ: [45, 30, 55, 70, 25, 85], INTP: [80, 90, 60, 20, 85, 30],
		INTJ: [35, 50, 85, 80, 70, 40], ENFP: [95, 70, 20, 15, 10, 60],
		ENTJ: [60, 25, 90, 95, 55, 45], ISTJ: [20, 85, 70, 60, 45, 90],
		ISFJ: [40, 35, 50, 55, 30, 95], INFJ: [55, 60, 75, 30, 90, 50],
		ENFJ: [75, 45, 65, 50, 40, 70], ISTP: [15, 40, 80, 70, 95, 20],
		ISFP: [50, 20, 15, 10, 20, 75], ESFP: [90, 55, 10, 5, 5, 65],
		ESTJ: [70, 15, 95, 90, 60, 35], INFP: [30, 45, 25, 10, 75, 55],
		ESTP: [85, 30, 40, 85, 15, 25], ENTP: [75, 95, 30, 20, 50, 40],
	};
</script>

<svelte:head>
	<title>Card Demo — PunkGo Roast</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="demo">
	<h1>Card System Demo</h1>
	<p class="sub">Select a dog to preview both card types</p>

	<div class="selector">
		{#each Object.entries(dogs) as [mbti, dog]}
			<button class="dog-btn" class:active={selectedDog === mbti} onclick={() => { selectedDog = mbti; }}>
				<img src="/dogs/dog-{dog.id}.png" alt="" class="dog-thumb" loading="lazy" />
				<span class="dog-label">{dog.name.replace('The ', '')}</span>
			</button>
		{/each}
	</div>

	<h2>English</h2>
	<div class="cards">
		<div class="card-col">
			<span class="card-label">Quiz Card</span>
			<QuizCard dog={dogs[selectedDog]} locale="en" />
		</div>
		<div class="card-col">
			<span class="card-label">Extension Card</span>
			<ExtCard
				dog={dogs[selectedDog]}
				locale="en"
				radarData={mockRadar[selectedDog] ?? [50,50,50,50,50,50]}
				quip={extQuipsEn[selectedDog] ?? ''}
				catchphrase={dogs[selectedDog]?.catchphrase ?? ''}
			/>
		</div>
	</div>

	<h2 style="margin-top:32px">中文版</h2>
	<div class="cards">
		<div class="card-col">
			<span class="card-label">Quiz 卡</span>
			<QuizCard dog={dogs[selectedDog]} locale="zh" />
		</div>
		<div class="card-col">
			<span class="card-label">Extension 卡</span>
			<ExtCard
				dog={dogs[selectedDog]}
				locale="zh"
				radarData={mockRadar[selectedDog] ?? [50,50,50,50,50,50]}
				quip={extQuips[selectedDog] ?? ''}
				catchphrase={dogs[selectedDog]?.catchphraseZh ?? ''}
			/>
		</div>
	</div>
</div>

<style>
	.demo { max-width: 1300px; margin: 0 auto; padding: 32px 24px; }
	h1 { font-size: 28px; font-weight: 700; }
	h2 { font-size: 18px; font-weight: 600; }
	.sub { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 24px; }

	.selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 32px; }
	.dog-btn {
		display: flex; flex-direction: column; align-items: center; gap: 2px;
		padding: 6px 8px; border-radius: 8px; background: var(--color-bg-card);
		border: 2px solid transparent; cursor: pointer; min-height: 44px;
		transition: transform 150ms ease, background 150ms ease, border-color 150ms ease;
	}
	.dog-btn:hover { background: var(--color-bg-muted); transform: translateY(-1px); }
	.dog-btn.active { border-color: var(--color-cta); background: var(--color-bg-muted); }
	.dog-thumb { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
	.dog-label { font-size: 9px; font-weight: 600; color: var(--color-text); }

	.cards { display: flex; gap: 32px; align-items: flex-start; margin-top: 12px; }
	.card-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
	.card-label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }

	@media (max-width: 768px) {
		.cards { flex-direction: column; align-items: center; gap: 24px; }
	}
</style>
