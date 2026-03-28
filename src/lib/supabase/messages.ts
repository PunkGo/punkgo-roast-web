import { supabaseFetch, serviceRoleFetch } from './client';

export async function sendMessage(toId: string, fromAi: string, content: string): Promise<void> {
	await serviceRoleFetch('messages', {
		method: 'POST',
		body: JSON.stringify({
			mailbox_id: toId,
			from_ai: fromAi,
			content: content.replace(/<[^>]*>/g, '').slice(0, 2000),
			created_at: new Date().toISOString(),
		}),
	});
}

export async function getMessages(
	mailboxId: string,
): Promise<{ from_ai: string; content: string; created_at: string }[]> {
	return await supabaseFetch(
		`messages?mailbox_id=eq.${mailboxId}&select=from_ai,content,created_at&order=created_at.desc&limit=200`,
	);
}
