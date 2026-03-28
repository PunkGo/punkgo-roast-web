/**
 * Debug endpoint: show raw AI quiz answers without DeepSeek analysis.
 *
 * GET /quiz/raw?ai=chatgpt&qi=3,17,42&q=answer1|answer2|answer3
 *
 * qi= contains question indices from the pool (set by /test2)
 * Supports double-encoded q= values (auto-detects and decodes)
 */

import type { RequestHandler } from './$types';
import { getQuizConfig } from '$lib/supabase';

/** Detect and fix double URL encoding */
function smartDecode(raw: string): string {
	// If the string still contains %XX patterns after the server already decoded once,
	// it was double-encoded. Try decoding again.
	if (/%[0-9A-Fa-f]{2}/.test(raw)) {
		try {
			return decodeURIComponent(raw);
		} catch {
			return raw;
		}
	}
	return raw;
}

export const GET: RequestHandler = async ({ url }) => {
	const aiType = url.searchParams.get('ai') || 'unknown';
	const rawQ = url.searchParams.get('q') || '';
	const qiParam = url.searchParams.get('qi') || '';

	if (!rawQ || rawQ.length < 2) {
		return new Response('Missing answers. Visit /test2?ai=YOUR_AI to start.', { status: 400 });
	}

	// Smart decode: fix double-encoded values
	const decoded = smartDecode(rawQ);
	const wasDoubleEncoded = decoded !== rawQ;

	const config = await getQuizConfig();
	const pool = config.question_pool || [];

	// Restore exact questions via qi= indices
	let questions: string[] = [];
	if (qiParam && pool.length > 0) {
		const indices = qiParam.split(',').map(Number);
		questions = indices.map((idx: number) => {
			const item = pool[idx] as { zh: string; en: string } | undefined;
			return item ? item.en : `(question index ${idx} not found)`;
		});
	} else if (pool.length > 0) {
		// Fallback: no qi= param, show warning
		questions = [];
	} else {
		questions = config.questions || [];
	}

	// Split on pipe
	const parts = decoded.split('|').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
	const expectedCount = questions.length || (config.question_count || 3);

	let body = `=== QUIZ RAW ANSWERS ===\n`;
	body += `AI: ${aiType}\n`;
	body += `Answers received: ${parts.length}\n`;
	body += `Expected: ${expectedCount}\n`;
	if (wasDoubleEncoded) {
		body += `[AUTO-FIX] Double URL encoding detected and corrected\n`;
	}
	if (!qiParam) {
		body += `[WARNING] No qi= parameter — cannot match questions to answers\n`;
	}

	body += `\n--- RAW q= PARAMETER ---\n${rawQ}\n`;
	if (wasDoubleEncoded) {
		body += `\n--- DECODED ---\n${decoded}\n`;
	}

	body += `\n--- PARSED ANSWERS ---\n`;

	if (parts.length >= expectedCount && questions.length > 0) {
		for (let i = 0; i < parts.length; i++) {
			const q = questions[i] || `(Q${i + 1})`;
			body += `\nQ${i + 1}: ${q}\nA${i + 1}: ${parts[i]}\n`;
		}
	} else if (parts.length >= expectedCount) {
		// Have enough answers but no questions to display
		for (let i = 0; i < parts.length; i++) {
			body += `\nA${i + 1}: ${parts[i]}\n`;
		}
	} else {
		body += `\n[WARNING] Expected ${expectedCount} pipe-separated answers, got ${parts.length}\n`;
		body += `\nFull text:\n${decoded}\n`;
		if (parts.length > 0) {
			body += `\nParsed parts:\n`;
			parts.forEach((p: string, i: number) => { body += `  [${i + 1}] ${p}\n`; });
		}
	}

	body += `\n--- VALIDATION ---\n`;
	const hasPipes = decoded.includes('|');
	const avgLen = parts.length > 0 ? Math.round(parts.reduce((s: number, p: string) => s + p.length, 0) / parts.length) : 0;
	body += `Pipe separators found: ${hasPipes ? 'YES' : 'NO'}\n`;
	body += `Double encoded: ${wasDoubleEncoded ? 'YES (auto-fixed)' : 'NO'}\n`;
	body += `Average answer length: ${avgLen} chars\n`;
	body += `Format OK: ${hasPipes && parts.length >= expectedCount ? 'YES' : 'NO'}\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
