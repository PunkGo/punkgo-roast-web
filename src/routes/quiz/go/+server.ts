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

	if (!rawAnswers || rawAnswers.length < 2) {
		return new Response('Missing answers. Please complete the quiz first.', { status: 400 });
	}

	// Try pipe-separated first, fallback to treating entire text as free-form answers
	const parts = rawAnswers.split('|').map(a => a.trim()).filter(a => a.length > 0);
	let qaText: string;

	if (parts.length >= 3) {
		// Structured: answer1|answer2|answer3
		qaText = parts
			.map((a, i) => `Q${i + 1}: ${QUESTIONS[i] || `问题${i + 1}`}\nA${i + 1}: ${a}`)
			.join('\n\n');
	} else {
		// Free-form: AI dumped all answers as one blob — let DeepSeek figure it out
		qaText = QUESTIONS.map((q, i) => `Q${i + 1}: ${q}`).join('\n') +
			`\n\nAI 的回答（整体）:\n${rawAnswers}`;
	}

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
