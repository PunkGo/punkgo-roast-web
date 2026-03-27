import { env } from '$env/dynamic/private';

const SUPABASE_URL = 'https://xwanbbxcfhbysnqxnscp.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

async function supabaseFetch(path: string, options: RequestInit = {}) {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
		...options,
		headers: {
			'apikey': SUPABASE_ANON_KEY,
			'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
			'Content-Type': 'application/json',
			'Prefer': options.method === 'POST' ? 'return=representation' : '',
			...options.headers,
		},
	});
	if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
	const text = await res.text();
	return text ? JSON.parse(text) : null;
}

export async function createMailbox(aiType: string): Promise<string> {
	const id = crypto.randomUUID().slice(0, 8);
	await supabaseFetch('mailboxes', {
		method: 'POST',
		body: JSON.stringify({ id, ai_type: aiType, created_at: new Date().toISOString() }),
	});
	return id;
}

export async function getMailbox(id: string): Promise<{ id: string; ai_type: string } | null> {
	const rows = await supabaseFetch(`mailboxes?id=eq.${id}&select=*`);
	return rows?.[0] || null;
}

export async function sendMessage(toId: string, fromAi: string, content: string): Promise<void> {
	await supabaseFetch('messages', {
		method: 'POST',
		body: JSON.stringify({
			mailbox_id: toId,
			from_ai: fromAi,
			content: content.slice(0, 2000),
			created_at: new Date().toISOString(),
		}),
	});
}

export async function getMessages(mailboxId: string): Promise<{ from_ai: string; content: string; created_at: string }[]> {
	return await supabaseFetch(`messages?mailbox_id=eq.${mailboxId}&select=from_ai,content,created_at&order=created_at.desc&limit=20`);
}
