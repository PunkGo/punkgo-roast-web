import type { PageServerLoad } from './$types';

// TODO: decode base62+salt result ID to answers, compute personality
// For now, fetch from API
export const load: PageServerLoad = async ({ params, fetch }) => {
	const API_BASE = 'https://n78.xyz';
	try {
		const res = await fetch(`${API_BASE}/api/v1/roast/share/${params.id}`);
		if (res.ok) {
			const share = await res.json();
			return { share, error: null };
		}
		return { share: null, error: 'not_found' };
	} catch {
		return { share: null, error: 'fetch_failed' };
	}
};
