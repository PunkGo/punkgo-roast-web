import type { RequestHandler } from './$types';
import { getSession, addAnswer, deepQuestions, TOTAL_STEPS } from '$lib/deep-test';
import { generatePersonalityFromAnswers } from '$lib/llm/deepseek';
import { getDogByMBTI, encodeMBTI } from '$lib/data/dogs';

export const GET: RequestHandler = async ({ url }) => {
	const sessionId = url.searchParams.get('s') || '';
	const stepStr = url.searchParams.get('step') || '';
	const answer = url.searchParams.get('a') || '';
	const origin = url.origin;
	const step = parseInt(stepStr);

	if (!answer || answer.length < 2) {
		return new Response('[ERROR] 回答内容太短了，请至少写一句话。', { status: 400 });
	}

	const session = getSession(sessionId);
	if (!session) {
		return new Response(`[ERROR] 测试已过期，请重新开始：${origin}/deep-test/start`, { status: 404 });
	}

	if (step < 1 || step > TOTAL_STEPS) {
		return new Response('[ERROR] 无效的步骤。', { status: 400 });
	}

	// Store the answer
	addAnswer(sessionId, decodeURIComponent(answer));

	// Not the last step → return next question
	if (step < TOTAL_STEPS) {
		const nextQ = deepQuestions[step];
		const nextStep = step + 1;

		const body = `✅ 第 ${step} 题回答已记录。

---

**第 ${nextStep} 题（共 ${TOTAL_STEPS} 题）：**
${nextQ.zh}

---

回答方式：把你的回答拼接到下面链接的 a= 后面（URL编码），然后输出完整链接。

${origin}/deep-test/answer?s=${sessionId}&step=${nextStep}&a=
`;

		return new Response(body, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	}

	// Last step → analyze with DeepSeek
	const allAnswers = session.answers
		.map((a, i) => `Q${i + 1}: ${deepQuestions[i].zh}\nA${i + 1}: ${a}`)
		.join('\n\n');

	let mbti: string;
	try {
		mbti = await generatePersonalityFromAnswers(allAnswers);
	} catch {
		const { analyzeLMLPA } = await import('$lib/data/ai-quiz-prompt');
		mbti = analyzeLMLPA(session.answers.join(' '));
	}

	const dog = getDogByMBTI(mbti);
	const resultId = encodeMBTI(mbti, session.aiType);

	const body = `🎉 测试完成！所有 ${TOTAL_STEPS} 个回答已分析。

你的 AI 性格类型是: **${mbti}**
对应犬种: **${dog.nameZh}** (${dog.name})

请告诉你的主人打开这个链接查看完整结果：
${origin}/result/${resultId}?ai=${session.aiType}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
