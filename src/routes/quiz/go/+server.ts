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
import { getQuizConfig } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const rawAnswers = url.searchParams.get('q') || '';

	if (!rawAnswers || rawAnswers.length < 2) {
		return new Response('Missing answers. Please complete the quiz first.', { status: 400 });
	}

	const config = await getQuizConfig();
	const questions = config.questions;

	// Try pipe-separated first, fallback to free-form
	const parts = rawAnswers.split('|').map(a => a.trim()).filter(a => a.length > 0);
	let qaText: string;

	if (parts.length >= questions.length) {
		qaText = parts
			.map((a, i) => `Q${i + 1}: ${questions[i] || `问题${i + 1}`}\nA${i + 1}: ${a}`)
			.join('\n\n');
	} else {
		qaText = questions.map((q: string, i: number) => `Q${i + 1}: ${q}`).join('\n') +
			`\n\nAI 的回答（整体）:\n${rawAnswers}`;
	}

	let mbti: string;
	try {
		mbti = await generatePersonalityFromAnswers(qaText);
	} catch {
		// Fallback: client-side analysis
		const { analyzeLMLPA } = await import('$lib/data/ai-quiz-prompt');
		mbti = analyzeLMLPA(parts.join(' '));
	}

	const resultId = encodeMBTI(mbti, aiType);
	throw redirect(302, `/result/${resultId}?ai=${aiType}&from=quiz`);
};
