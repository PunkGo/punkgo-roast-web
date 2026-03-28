/**
 * Debug endpoint: show raw AI quiz answers without DeepSeek analysis.
 *
 * GET /quiz/raw?ai=chatgpt&q=answer1|answer2|answer3
 */

import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const rawAnswers = url.searchParams.get('q') || '';

	if (!rawAnswers || rawAnswers.length < 2) {
		return new Response('Missing answers. Visit /test2?ai=YOUR_AI to start.', { status: 400 });
	}

	const config = await getQuizConfig();
	const pool = config.question_pool || [];
	const count = config.question_count || 3;

	let questions: string[];
	if (pool.length > 0) {
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		questions = shuffled.slice(0, count).map((q: { zh: string; en: string }) => q.en);
	} else {
		questions = config.questions || [];
	}

	// Try pipe-separated first, fallback to showing raw
	const parts = rawAnswers.split('|').map(a => a.trim()).filter(a => a.length > 0);

	let body = `=== QUIZ RAW ANSWERS ===\n`;
	body += `AI: ${aiType}\n`;
	body += `Answers received: ${parts.length}\n`;
	body += `Expected: ${questions.length}\n`;
	body += `\n--- RAW q= PARAMETER ---\n${rawAnswers}\n`;
	body += `\n--- PARSED ANSWERS ---\n`;

	if (parts.length >= questions.length) {
		for (let i = 0; i < parts.length; i++) {
			const q = questions[i] || `(question ${i + 1} not found)`;
			body += `\nQ${i + 1}: ${q}\nA${i + 1}: ${parts[i]}\n`;
		}
	} else {
		body += `\n[WARNING] Expected ${questions.length} pipe-separated answers, got ${parts.length}\n`;
		body += `\nFull raw text:\n${rawAnswers}\n`;
		if (parts.length > 0) {
			body += `\nParsed parts:\n`;
			parts.forEach((p: string, i: number) => { body += `  [${i + 1}] ${p}\n`; });
		}
	}

	body += `\n--- VALIDATION ---\n`;
	const hasPipes = rawAnswers.includes('|');
	const avgLen = parts.length > 0 ? Math.round(parts.reduce((s, p) => s + p.length, 0) / parts.length) : 0;
	body += `Pipe separators found: ${hasPipes ? 'YES' : 'NO'}\n`;
	body += `Average answer length: ${avgLen} chars\n`;
	body += `Format OK: ${hasPipes && parts.length >= questions.length ? 'YES' : 'NO'}\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
