<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Question {
		id: number;
		title: string;
		titleZh: string;
		desc: string;
		descZh: string;
		emoji: string;
		options: { label: string; labelZh: string; choice: string; emoji: string }[];
	}

	const questions: Question[] = [
		{
			id: 1, emoji: '💬',
			title: 'Do you say "thank you" to AI?',
			titleZh: '你跟 AI 说"谢谢"吗？',
			desc: 'AI just nailed a big task for you. Your first reaction is—',
			descZh: 'AI 帮你搞定了一个大活儿。你的第一反应是——',
			options: [
				{ label: '"Thanks so much!" Then realize you\'re dating Siri', labelZh: '"谢谢你！辛苦了！" 然后觉得自己在跟 Siri 谈恋爱', choice: 'A', emoji: '🥰' },
				{ label: '"Nice. Next." Efficiency first, feelings are a bug', labelZh: '"不错，下一个。" 效率至上，感情是 bug', choice: 'B', emoji: '😎' },
				{ label: 'Share in group chat: "look how well I trained it"', labelZh: '发给群里炫耀 "看我调教得多好"', choice: 'C', emoji: '🗣️' },
				{ label: 'Quietly screenshot it — this is your secret weapon', labelZh: '默默截图存在备忘录，这是我的秘密武器', choice: 'D', emoji: '🤫' },
			],
		},
		{
			id: 2, emoji: '😤',
			title: 'AI gave you a bad answer. Now what?',
			titleZh: 'AI 给你的回答你不满意，怎么办？',
			desc: 'You asked AI to write something. The result is... unhinged.',
			descZh: '你让 AI 帮你写个东西，结果拿到手一看——离谱。',
			options: [
				{ label: 'Write a 500-word prompt with exact specs', labelZh: '写一段 500 字的 prompt 精确描述', choice: 'A', emoji: '📝' },
				{ label: '"No no no" spam three messages and argue', labelZh: '"不对不对不对"连发三条，跟它吵', choice: 'B', emoji: '🤬' },
				{ label: 'Forget it, faster to fix it myself', labelZh: '算了，自己改比教它快', choice: 'C', emoji: '🙄' },
				{ label: 'Ask from a different angle', labelZh: '换个角度问，也许更有趣', choice: 'D', emoji: '🔄' },
			],
		},
		{
			id: 3, emoji: '🌙',
			title: '2 AM. What are you and AI chatting about?',
			titleZh: '深夜 2 点，你跟 AI 在聊什么？',
			desc: 'Normal people are sleeping. You\'re—',
			descZh: '正常人在睡觉。你在——',
			options: [
				{ label: 'Planning tomorrow\'s to-do list', labelZh: '让它帮我规划明天的待办清单', choice: 'A', emoji: '📋' },
				{ label: '"If a cat had LinkedIn, what would its headline be?"', labelZh: '"如果猫有 LinkedIn，headline 写什么？"', choice: 'B', emoji: '🐱' },
				{ label: 'Researching a real problem until you find a solution', labelZh: '研究一个实际问题直到找到方案', choice: 'C', emoji: '🔬' },
				{ label: 'Letting it be your therapist', labelZh: '让它陪我聊人生，反正不会烦', choice: 'D', emoji: '🛋️' },
			],
		},
		{
			id: 4, emoji: '👥',
			title: 'Your friends start using AI. Your reaction?',
			titleZh: '朋友也开始用 AI 了，你的反应？',
			desc: 'People around you are starting to use AI for everything.',
			descZh: '你发现身边的人开始用 AI 做各种事。',
			options: [
				{ label: 'Start a group chat to share your prompt library', labelZh: '立刻拉群分享 prompt 库', choice: 'A', emoji: '📢' },
				{ label: 'Observe quietly, mentally scoring their technique', labelZh: '暗中观察，心里默默打分', choice: 'B', emoji: '🧐' },
				{ label: '"You guys just started? I was using it last year."', labelZh: '"你们才开始？我去年就用了。"', choice: 'C', emoji: '💅' },
				{ label: 'Help them one by one, hand-holding through setup', labelZh: '帮他们一个一个调试', choice: 'D', emoji: '🤝' },
			],
		},
		{
			id: 5, emoji: '🌃',
			title: "Friday night. AI has no tasks. What do you do?",
			titleZh: '周五晚上，AI 没任务了。你会？',
			desc: 'No deadlines, no tasks. You and AI have a free evening—',
			descZh: '没有 deadline，没有任务。空闲的晚上——',
			options: [
				{ label: 'Organize all saved prompts into a system', labelZh: '把攒了一周的 prompt 整理成体系', choice: 'A', emoji: '🗂️' },
				{ label: '"Generate 10 weird startup ideas involving dogs"', labelZh: '"生成 10 个关于狗的离谱创业 idea"', choice: 'B', emoji: '🐕' },
				{ label: 'Actually take the night off', labelZh: '真的休息了。AI 明天还在', choice: 'C', emoji: '😴' },
				{ label: 'Start a side project you\'ll abandon by Monday', labelZh: '开一个新坑，周一就忘了', choice: 'D', emoji: '🚀' },
			],
		},
	];

	const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

	let currentQ = $state(0);
	let answers: { question: number; choice: string }[] = $state([]);
	let isZh = $state(false);
	let selectedChoice: string | null = $state(null);
	let transitioning = $state(false);

	onMount(() => { isZh = navigator.language.startsWith('zh'); });

	function selectOption(choice: string) {
		if (selectedChoice) return;
		selectedChoice = choice;
		answers = [...answers, { question: questions[currentQ].id, choice }];
		setTimeout(() => {
			if (currentQ < questions.length - 1) {
				transitioning = true;
				setTimeout(() => {
					selectedChoice = null;
					currentQ++;
					transitioning = false;
				}, 200);
			} else {
				submitQuiz();
			}
		}, 300);
	}

	async function submitQuiz() {
		try {
			const res = await fetch('/api/quiz-analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answers, locale: isZh ? 'zh' : 'en' }),
			});
			if (!res.ok) throw new Error('API error');
			const data = await res.json();
			if (data.resultId) {
				goto(`/result/${data.resultId}`);
			}
		} catch {
			// fallback: compute client-side and redirect
			const { computeMBTI, encodeResultId } = await import('$lib/data/dogs');
			const id = encodeResultId(answers);
			goto(`/result/${id}`);
		}
	}
</script>

<svelte:head>
	<title>{isZh ? '答题中 — PunkGo Roast' : 'Quiz — PunkGo Roast'}</title>
</svelte:head>

{#if true}
	{@const q = questions[currentQ]}
	<div class="quiz-screen" class:fade-out={transitioning}>
		<div class="progress">
			{#each questions as _, i}
				<div class="seg" class:active={i <= currentQ}></div>
			{/each}
		</div>
		<div class="counter">
			<span class="section-tag">Question {romanNumerals[currentQ]} of V</span>
		</div>
		<section class="question">
			<span class="section-tag">— Q U E S T I O N &nbsp; {romanNumerals[currentQ]} —</span>
			<h1>{isZh ? q.titleZh : q.title}</h1>
			<p class="desc">{isZh ? q.descZh : q.desc}</p>
		</section>
		<div class="options" role="radiogroup" aria-label={isZh ? '选择答案' : 'Choose your answer'}>
			{#each q.options as opt, i}
				<button
					class="opt-card"
					class:selected={selectedChoice === opt.choice}
					onclick={() => selectOption(opt.choice)}
					onkeydown={(e) => {
						const cards = [...(e.currentTarget as HTMLElement).parentElement!.querySelectorAll('.opt-card')] as HTMLElement[];
						const idx = cards.indexOf(e.currentTarget as HTMLElement);
						let next = -1;
						if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % cards.length;
						if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + cards.length) % cards.length;
						if (next >= 0) { e.preventDefault(); cards[next].focus(); }
					}}
					role="radio"
					aria-checked={selectedChoice === opt.choice}
					tabindex={i === 0 ? 0 : -1}
				>
					<span class="opt-emoji">{opt.emoji}</span>
					<span class="opt-text">{isZh ? opt.labelZh : opt.label}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.quiz-screen {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: calc(100vh - 56px);
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
	}
	.progress { display: flex; gap: 3px; padding: 0 24px; }
	.seg { flex: 1; height: 3px; background: var(--color-border); border-radius: 2px; transition: background 200ms ease; }
	.seg.active { background: var(--color-cta); }
	.counter { text-align: right; padding: 12px 24px 0; }

	.question {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 24px 0;
		text-align: center;
	}
	.question h1 { font-size: 32px; font-weight: 700; line-height: 1.15; }
	.desc { font-size: 15px; color: var(--color-text-secondary); }

	.options {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		padding: 32px 24px;
		flex: 1;
		align-content: start;
	}
	.opt-card {
		background: var(--color-bg-card);
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		cursor: pointer;
		text-align: left;
		transition: border-color 200ms ease, transform 200ms ease-out;
		min-height: 180px;
	}
	.opt-card:hover {
		border-color: var(--color-cta);
		transform: translateY(-4px);
	}
	.opt-card.selected {
		border-color: var(--color-cta);
		border-width: 2px;
		background: #F0EDE5;
	}
	.opt-card:focus-visible { outline: 2px solid var(--color-cta); outline-offset: 2px; }
	.opt-emoji { font-size: 24px; }
	.opt-text { font-size: 14px; color: var(--color-text-secondary); line-height: 1.4; }

	/* Quiz transition */
	.quiz-screen { transition: opacity 200ms ease; }
	.quiz-screen.fade-out { opacity: 0; }

	@media (prefers-reduced-motion: reduce) {
		.quiz-screen { transition: none; }
	}

	@media (max-width: 768px) {
		.options { grid-template-columns: 1fr 1fr; }
		.question h1 { font-size: 24px; }
	}
	@media (max-width: 639px) {
		.options { padding: 20px 16px; gap: 10px; }
		.opt-card { min-height: 110px; padding: 14px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.opt-card { transition: none; }
	}
</style>
