import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createKennel, createMailbox } from '$lib/supabase';
import { generateRecoveryCode } from '$lib/utils/recovery-code';
import { dogs } from '$lib/data/dogs';

const MBTI_RE = /^[EI][SN][TF][JP]$/;
const MAX_RETRIES = 3;

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const { resultId, mbti, aiType, dogId, quip, locale } = body;

	// Validate
	if (!mbti || !MBTI_RE.test(mbti)) {
		return json({ error: 'Invalid MBTI' }, { status: 400 });
	}
	if (!dogId || !Object.values(dogs).some((d) => d.id === dogId)) {
		return json({ error: 'Invalid dogId' }, { status: 400 });
	}

	const recoveryCode = generateRecoveryCode();
	const { id: mailboxId } = await createMailbox(aiType || 'unknown');

	let kennelId = '';
	for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
		kennelId = crypto.randomUUID().slice(0, 8);
		try {
			await createKennel({
				id: kennelId,
				recoveryCode,
				mailboxId,
				mbti,
				aiType: aiType || 'unknown',
				dogId,
				quip: quip || null,
				locale: locale || 'en'
			});
			break;
		} catch (e) {
			if (attempt === MAX_RETRIES - 1) {
				return json({ error: 'Failed to create kennel' }, { status: 500 });
			}
		}
	}

	cookies.set(`punkgo_k_${kennelId}`, '1', {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
		secure: true,
		httpOnly: false
	});

	return json({ kennelId, mailboxId, recoveryCode });
};
