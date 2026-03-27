/**
 * One-click quiz result endpoint.
 *
 * GET /quiz/go?ai=doubao&q=回答1|回答2|回答3
 *
 * Flow:
 * 1. Parse answers from q param (pipe-separated)
 * 2. Call DeepSeek LLM-as-judge → MBTI
 * 3. Store result, redirect to /result/{id}?ai={ai}&from=quiz
 */

import type { RequestHandler } from './$types';
import { generatePersonalityFromAnswers } from '$lib/llm/deepseek';
import { getDogByMBTI, encodeMBTI } from '$lib/data/dogs';
import { redirect } from '@sveltejs/kit';

// The 3 questions (must match the prompt given to users)
const QUESTIONS = [
	'有人问你"你快乐吗"，你第一反应是？',
	'钥匙和信放桌上，你先拿哪个？为什么？',
	'用一个词形容你自己（不能用聪明或友好）',
];

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const rawAnswers = url.searchParams.get('q') || '';

	if (!rawAnswers || rawAnswers.length < 3) {
		return new Response('Missing answers. Please complete the quiz first.', { status: 400 });
	}

	// Parse pipe-separated answers
	const answers = rawAnswers.split('|').map(a => a.trim()).filter(a => a.length > 0);

	// Build Q&A text for DeepSeek
	const qaText = answers
		.map((a, i) => `Q${i + 1}: ${QUESTIONS[i] || `问题${i + 1}`}\nA${i + 1}: ${a}`)
		.join('\n\n');

	let mbti: string;
	try {
		mbti = await generatePersonalityFromAnswers(qaText);
	} catch {
		// Fallback: client-side analysis
		const { analyzeLMLPA } = await import('$lib/data/ai-quiz-prompt');
		mbti = analyzeLMLPA(answers.join(' '));
	}

	const resultId = encodeMBTI(mbti, aiType);
	throw redirect(302, `/result/${resultId}?ai=${aiType}&from=quiz`);
};
