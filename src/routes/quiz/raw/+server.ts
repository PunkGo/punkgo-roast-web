/**
 * Debug endpoint: show raw AI quiz answers.
 *
 * GET /quiz/raw?ai=gpt&qi=3,17,42&A1=answer1&A2=answer2&A3=answer3
 *
 * Also supports legacy format: ?q=answer1|answer2|answer3 (with double-encode auto-fix)
 */

import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

/** Detect and fix double URL encoding */
function smartDecode(raw: string): string {
	if (/%[0-9A-Fa-f]{2}/.test(raw)) {
		try { return decodeURIComponent(raw); } catch { return raw; }
	}
	return raw;
}

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const qiParam = url.searchParams.get('qi') || '';

	const config = await getQuizConfig();
	const pool = config.question_pool || [];
	const expectedCount = config.question_count || 3;

	// Restore questions from qi= indices
	let questions: string[] = [];
	if (qiParam && pool.length > 0) {
		questions = qiParam.split(',').map(Number).map((idx: number) => {
			const item = pool[idx] as { zh: string; en: string } | undefined;
			return item ? item.en : `(index ${idx} not found)`;
		});
	}

	// Read answers: prefer A1/A2/A3 params, fallback to legacy q= pipe format
	let answers: string[] = [];
	let source = 'params';
	for (let i = 1; i <= 10; i++) {
		const a = url.searchParams.get(`A${i}`);
		if (a) answers.push(a);
		else break;
	}

	// Legacy: q= pipe-separated format
	let wasDoubleEncoded = false;
	let rawQ = '';
	if (answers.length === 0) {
		rawQ = url.searchParams.get('q') || '';
		if (rawQ) {
			source = 'legacy-q';
			const decoded = smartDecode(rawQ);
			wasDoubleEncoded = decoded !== rawQ;
			answers = decoded.split('|').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
		}
	}

	if (answers.length === 0) {
		return new Response('Missing answers. Visit /test2?ai=YOUR_AI to start.', { status: 400 });
	}

	// Build output
	let body = `=== QUIZ RAW ANSWERS ===\n`;
	body += `AI: ${aiType}\n`;
	body += `Source: ${source}\n`;
	body += `Answers received: ${answers.length}\n`;
	body += `Questions matched: ${questions.length}\n`;
	if (wasDoubleEncoded) body += `[AUTO-FIX] Double URL encoding detected and corrected\n`;
	if (!qiParam) body += `[WARNING] No qi= parameter — cannot match questions\n`;

	if (source === 'legacy-q') {
		body += `\n--- RAW q= ---\n${rawQ}\n`;
		if (wasDoubleEncoded) body += `--- DECODED ---\n${answers.join('|')}\n`;
	}

	body += `\n--- ANSWERS ---\n`;
	for (let i = 0; i < answers.length; i++) {
		if (questions[i]) {
			body += `\nQ${i + 1}: ${questions[i]}\nA${i + 1}: ${answers[i]}\n`;
		} else {
			body += `\nA${i + 1}: ${answers[i]}\n`;
		}
	}

	if (answers.length < (questions.length || expectedCount)) {
		body += `\n[WARNING] Expected ${questions.length || expectedCount} answers, got ${answers.length}\n`;
	}

	body += `\n--- VALIDATION ---\n`;
	const avgLen = Math.round(answers.reduce((s, a) => s + a.length, 0) / answers.length);
	body += `Format: ${source === 'params' ? 'A1/A2/A3 params (v2)' : 'legacy q= pipe'}\n`;
	body += `Double encoded: ${wasDoubleEncoded ? 'YES (auto-fixed)' : 'NO'}\n`;
	body += `Average answer length: ${avgLen} chars\n`;
	body += `Format OK: ${answers.length >= (questions.length || expectedCount) ? 'YES' : 'NO'}\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
