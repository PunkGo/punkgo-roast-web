import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { updateKennel, updateMailboxAiType, getKennel } from '$lib/supabase';

const MBTI_RE = /^[EI][SN][TF][JP]$/;

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const { kennelId, mbti, aiType, dogId, quip } = body;

	const cookieKennel = cookies.get('punkgo_kennel');
	if (!cookieKennel || cookieKennel !== kennelId) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	if (!mbti || !MBTI_RE.test(mbti)) {
		return json({ error: 'Invalid MBTI' }, { status: 400 });
	}

	const kennel = await getKennel(kennelId);
	if (!kennel) {
		return json({ error: 'Kennel not found' }, { status: 404 });
	}

	await updateKennel(kennelId, { mbti, aiType, dogId, quip });

	if (kennel.mailbox_id && aiType) {
		await updateMailboxAiType(kennel.mailbox_id, aiType);
	}

	return json({ ok: true });
};
