/**
 * One-click quiz result endpoint.
 *
 * v2: GET /quiz/go?ai=gpt&qi=3,17,42&A1=answer1&A2=answer2&A3=answer3
 * Legacy: GET /quiz/go?ai=doubao&q=回答1|回答2|回答3
 *
 * Flow:
 * 1. Parse answers from A1/A2/A3 params (or legacy q= pipe-separated)
 * 2. Call DeepSeek LLM-as-judge → MBTI
 * 3. Store result, redirect to /result/{id}?ai={ai}&from=quiz
 */

import type { RequestHandler } from './$types';
import { generatePersonalityFromAnswers } from '$lib/llm/deepseek';
import { encodeMBTI } from '$lib/data/dogs';
import { getQuizConfig } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';

/** Detect and fix multi-layer URL encoding (DeepSeek encodes 2-3x) */
function smartDecode(raw: string): string {
	let result = raw;
	for (let i = 0; i < 5; i++) {
		if (!/%[0-9A-Fa-f]{2}/.test(result)) break;
		try { result = decodeURIComponent(result); } catch { break; }
	}
	return result;
}

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const qiParam = url.searchParams.get('qi') || '';

	const config = await getQuizConfig();
	const pool = config.question_pool || [];

	// Restore questions from qi= indices, fallback to config.questions
	let questions: string[];
	if (qiParam && pool.length > 0) {
		questions = qiParam.split(',').map(Number).map((idx: number) => {
			const item = pool[idx] as { zh: string; en: string } | undefined;
			return item ? item.en : `Question ${idx + 1}`;
		});
	} else {
		questions = config.questions || [];
	}

	// Read answers: prefer A1/A2/A3 params, fallback to legacy q=
	let parts: string[] = [];
	for (let i = 1; i <= 10; i++) {
		const raw = url.searchParams.get(`A${i}`);
		if (raw) parts.push(smartDecode(raw));
		else break;
	}

	// Legacy: q= pipe-separated
	if (parts.length === 0) {
		const rawAnswers = url.searchParams.get('q') || '';
		if (!rawAnswers || rawAnswers.length < 2) {
			return new Response('Missing answers. Please complete the quiz first.', { status: 400 });
		}
		const decoded = smartDecode(rawAnswers);
		parts = decoded.split('|').map(a => a.trim()).filter(a => a.length > 0);
	}

	if (parts.length === 0) {
		return new Response('Missing answers. Please complete the quiz first.', { status: 400 });
	}

	// Build Q&A text for LLM judge
	let qaText: string;
	if (parts.length >= questions.length) {
		qaText = parts
			.map((a, i) => `Q${i + 1}: ${questions[i] || `Question ${i + 1}`}\nA${i + 1}: ${a}`)
			.join('\n\n');
	} else {
		qaText = questions.map((q: string, i: number) => `Q${i + 1}: ${q}`).join('\n') +
			`\n\nAI's answers:\n${parts.join('\n')}`;
	}

	console.log('[quiz/go]', JSON.stringify({ ai: aiType, qi: qiParam, parts, qaText }));

	// Debug mode: show qaText without calling DeepSeek
	if (url.searchParams.has('debug')) {
		return new Response(
			`=== QUIZ/GO DEBUG ===\nAI: ${aiType}\nqi: ${qiParam}\n\n--- qaText (sent to DeepSeek) ---\n${qaText}\n\n--- raw parts ---\n${parts.map((p, i) => `[${i}] ${p}`).join('\n')}`,
			{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
		);
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
