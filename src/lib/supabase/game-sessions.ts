/**
 * Game Sessions — Supabase CRUD for "The Missing Room" puzzle game
 */
import { serviceRoleFetch, supabaseFetch } from './client';

export interface GameSession {
	id: string;
	ai_name: string;
	player_name: string;
	current_round: number;
	choices: string[];
	status: 'playing' | 'completed' | 'failed';
	locale: string;
	created_at: string;
}

export async function createGameSession(session: {
	id: string;
	aiName: string;
	playerName: string;
	locale: string;
}): Promise<GameSession> {
	const rows = await serviceRoleFetch('game_sessions', {
		method: 'POST',
		body: JSON.stringify({
			id: session.id,
			ai_name: session.aiName,
			player_name: session.playerName,
			locale: session.locale,
			current_round: 1,
			choices: [],
			status: 'playing',
		}),
	});
	return rows[0];
}

export async function getGameSession(id: string): Promise<GameSession | null> {
	const rows = await supabaseFetch(`game_sessions?id=eq.${id}&select=*`);
	return rows?.[0] || null;
}

export async function advanceGameRound(id: string, choice: string): Promise<GameSession | null> {
	const session = await getGameSession(id);
	if (!session || session.status !== 'playing') return null;

	const newChoices = [...session.choices, choice];
	const newRound = session.current_round + 1;
	const isComplete = newRound >= 10; // Complete after round 9 choice (round 10 is ending only)

	// Optimistic concurrency: only update if current_round hasn't changed
	const rows = await serviceRoleFetch(`game_sessions?id=eq.${id}&current_round=eq.${session.current_round}`, {
		method: 'PATCH',
		headers: { 'Prefer': 'return=representation' },
		body: JSON.stringify({
			current_round: isComplete ? 10 : newRound,
			choices: newChoices,
			status: isComplete ? 'completed' : 'playing',
		}),
	});

	// If no rows updated, another request already advanced this round
	if (!rows || rows.length === 0) return null;
	return rows[0];
}
