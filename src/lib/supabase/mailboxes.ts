import { supabaseFetch, serviceRoleFetch } from './client';

export async function createMailbox(aiType: string): Promise<{ id: string; publicId: string }> {
	const id = crypto.randomUUID().slice(0, 8);
	const public_id = crypto.randomUUID().slice(0, 8);
	await serviceRoleFetch('mailboxes', {
		method: 'POST',
		body: JSON.stringify({ id, public_id, ai_type: aiType, created_at: new Date().toISOString() }),
	});
	return { id, publicId: public_id };
}

export async function getMailbox(id: string): Promise<{ id: string; ai_type: string } | null> {
	const rows = await supabaseFetch(`mailboxes?id=eq.${id}&select=*`);
	return rows?.[0] || null;
}

export async function getMailboxByPublicId(
	publicId: string,
): Promise<{ id: string; ai_type: string; public_id: string } | null> {
	const rows = await supabaseFetch(`mailboxes?public_id=eq.${publicId}&select=*`);
	return rows?.[0] || null;
}

export async function updateMailboxAiType(id: string, aiType: string): Promise<void> {
	await serviceRoleFetch(`mailboxes?id=eq.${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ ai_type: aiType }),
	});
}
