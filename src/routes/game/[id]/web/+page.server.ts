import { getGameSession } from '$lib/supabase';

export async function load({ params }) {
	const session = await getGameSession(params.id);
	if (!session) return { error: true };
	return { session };
}
