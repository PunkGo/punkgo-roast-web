import { env } from '$env/dynamic/private';

export const SUPABASE_URL = 'https://xwanbbxcfhbysnqxnscp.supabase.co';
export const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_ANON_KEY) {
	throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export function validateId(id: string): boolean {
	return /^[a-z0-9]{8}$/.test(id);
}

export async function supabaseFetch(path: string, options: RequestInit = {}) {
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

export async function serviceRoleFetch(path: string, options: RequestInit = {}) {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
		...options,
		headers: {
			'apikey': SUPABASE_SERVICE_ROLE_KEY,
			'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json',
			'Prefer': options.method === 'POST' ? 'return=representation' : '',
			...options.headers,
		},
	});
	if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
	const text = await res.text();
	return text ? JSON.parse(text) : null;
}
