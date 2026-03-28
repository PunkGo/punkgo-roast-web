import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getKennelByRecoveryCode } from '$lib/supabase';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const { recoveryCode } = body;

	if (!recoveryCode || recoveryCode.length < 4) {
		return json({ error: 'Invalid recovery code' }, { status: 400 });
	}

	const kennel = await getKennelByRecoveryCode(recoveryCode);
	if (!kennel) {
		return json({ error: 'not_found' }, { status: 404 });
	}

	cookies.set(`punkgo_k_${kennel.id}`, '1', {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
		secure: true,
		httpOnly: false
	});

	return json({ kennelId: kennel.id });
};
