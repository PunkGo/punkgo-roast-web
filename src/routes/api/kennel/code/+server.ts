/**
 * GET /api/kennel/code?id={kennelId}
 * Returns recovery code ONLY if the request has the matching per-kennel cookie.
 */
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getKennel, validateId } from '$lib/supabase';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const kennelId = url.searchParams.get('id') || '';

	if (!validateId(kennelId)) {
		return json({ error: 'Invalid kennel ID' }, { status: 400 });
	}

	// Strict cookie check — must have per-kennel cookie
	const cookieValue = cookies.get(`punkgo_k_${kennelId}`);
	if (!cookieValue) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const kennel = await getKennel(kennelId);
	if (!kennel) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return json({ recoveryCode: kennel.recovery_code });
};
