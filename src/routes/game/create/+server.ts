/**
 * POST /game/create — Create a new game session
 */
import type { RequestHandler } from './$types';
import { createGameSession } from '$lib/supabase';

export const POST: RequestHandler = async ({ request }) => {
	const { aiName, playerName, locale } = await request.json();

	const isZh = locale === 'zh';
	if (!aiName?.trim() || !playerName?.trim()) {
		return new Response(JSON.stringify({ error: isZh ? '请输入名称' : 'Missing names' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const id = crypto.randomUUID().slice(0, 8).toLowerCase();

	try {
		await createGameSession({
			id,
			aiName: aiName.trim().slice(0, 30),
			playerName: playerName.trim().slice(0, 30),
			locale: locale === 'zh' ? 'zh' : 'en',
		});

		return new Response(JSON.stringify({ id }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		console.error('[game/create] failed:', e);
		return new Response(JSON.stringify({ error: isZh ? '创建失败，请重试' : 'Failed to create game' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
