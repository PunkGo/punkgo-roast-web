import { supabaseFetch, serviceRoleFetch } from './client';

export async function saveResult(
	id: string,
	mbti: string,
	aiType: string,
	quip: string | null,
): Promise<void> {
	try {
		await serviceRoleFetch('results', {
			method: 'POST',
			body: JSON.stringify({ id, mbti, ai_type: aiType, quip, created_at: new Date().toISOString() }),
			headers: { 'Prefer': 'resolution=merge-duplicates' },
		});
	} catch {
		/* best effort */
	}
}

export async function getResult(
	id: string,
): Promise<{ id: string; mbti: string; ai_type: string; quip: string | null } | null> {
	try {
		const rows = await supabaseFetch(`results?id=eq.${id}&select=*`);
		return rows?.[0] || null;
	} catch {
		return null;
	}
}
