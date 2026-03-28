import { supabaseFetch, serviceRoleFetch } from './client';
import { formatRecoveryCode } from '$lib/utils/recovery-code';

export interface Kennel {
	id: string;
	recovery_code: string;
	mailbox_id: string;
	mbti: string;
	ai_type: string;
	dog_id: string;
	quip: string | null;
	locale: string;
	test_count: number;
	created_at: string;
	updated_at: string;
}

export async function createKennel(data: {
	id: string;
	recoveryCode: string;
	mailboxId: string;
	mbti: string;
	aiType: string;
	dogId: string;
	quip: string | null;
	locale: string;
}): Promise<void> {
	await serviceRoleFetch('kennels', {
		method: 'POST',
		body: JSON.stringify({
			id: data.id,
			recovery_code: data.recoveryCode,
			mailbox_id: data.mailboxId,
			mbti: data.mbti,
			ai_type: data.aiType,
			dog_id: data.dogId,
			quip: data.quip,
			locale: data.locale,
			test_count: 1,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}),
	});
}

export async function getKennel(id: string): Promise<Kennel | null> {
	const rows = await supabaseFetch(`kennels?id=eq.${id}&select=*`);
	return rows?.[0] || null;
}

export async function updateKennel(
	id: string,
	data: {
		mbti: string;
		aiType: string;
		dogId: string;
		quip: string | null;
	}
): Promise<boolean> {
	// Read current to get test_count (PostgREST doesn't support increment expressions)
	const current = await getKennel(id);
	if (!current) return false;

	await serviceRoleFetch(`kennels?id=eq.${id}`, {
		method: 'PATCH',
		body: JSON.stringify({
			mbti: data.mbti,
			ai_type: data.aiType,
			dog_id: data.dogId,
			quip: data.quip,
			test_count: current.test_count + 1,
			updated_at: new Date().toISOString(),
		}),
	});
	return true;
}

export async function getKennelByRecoveryCode(code: string): Promise<Kennel | null> {
	const formatted = formatRecoveryCode(code);
	const rows = await supabaseFetch(`kennels?recovery_code=eq.${formatted}&select=*`);
	return rows?.[0] || null;
}
