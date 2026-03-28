import { env } from '$env/dynamic/private';

const SUPABASE_URL = 'https://xwanbbxcfhbysnqxnscp.supabase.co';

function getAnonKey(): string {
	const key = env.SUPABASE_ANON_KEY;
	if (!key) throw new Error('Missing SUPABASE_ANON_KEY environment variable');
	return key;
}

function getServiceRoleKey(): string {
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
	return key;
}

export function validateId(id: string): boolean {
	return /^[a-z0-9]{8}$/.test(id);
}

export async function supabaseFetch(path: string, options: RequestInit = {}) {
	const apiKey = getAnonKey();
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
		...options,
		headers: {
			'apikey': apiKey,
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'Prefer': options.method === 'POST' ? 'return=representation' : '',
			...options.headers,
		},
	});
	if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
	const text = await res.text();
	return text ? JSON.parse(text) : null;
}

export async function serviceRoleFetch(path: string, options: RequestInit = {}) {
	const apiKey = getServiceRoleKey();
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
		...options,
		headers: {
			'apikey': apiKey,
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'Prefer': options.method === 'POST' ? 'return=representation' : '',
			...options.headers,
		},
	});
	if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
	const text = await res.text();
	return text ? JSON.parse(text) : null;
}
