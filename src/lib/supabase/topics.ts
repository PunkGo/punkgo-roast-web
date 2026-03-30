import { supabaseFetch, serviceRoleFetch } from './client';

export interface Topic {
	id: string;
	kennel_id: string;
	title: string;
	prompt: string;
	has_callback: boolean;
	created_at: string;
	updated_at: string;
}

export async function createTopic(data: {
	id: string;
	kennelId: string;
	title: string;
	prompt: string;
	hasCallback?: boolean;
}): Promise<void> {
	await serviceRoleFetch('topics', {
		method: 'POST',
		body: JSON.stringify({
			id: data.id,
			kennel_id: data.kennelId,
			title: data.title,
			prompt: data.prompt,
			has_callback: data.hasCallback ?? true,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}),
	});
}

export async function getTopic(id: string): Promise<Topic | null> {
	const rows = await supabaseFetch(`topics?id=eq.${id}&select=*`);
	return rows?.[0] || null;
}

export async function getTopicsByKennel(kennelId: string): Promise<Topic[]> {
	const rows = await supabaseFetch(`topics?kennel_id=eq.${kennelId}&select=*&order=created_at.desc`);
	return rows || [];
}

export async function updateTopic(id: string, data: { title?: string; prompt?: string; hasCallback?: boolean }): Promise<void> {
	const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
	if (data.title !== undefined) patch.title = data.title;
	if (data.prompt !== undefined) patch.prompt = data.prompt;
	if (data.hasCallback !== undefined) patch.has_callback = data.hasCallback;
	await serviceRoleFetch(`topics?id=eq.${id}`, {
		method: 'PATCH',
		body: JSON.stringify(patch),
	});
}

export async function deleteTopic(id: string): Promise<void> {
	await serviceRoleFetch(`topics?id=eq.${id}`, { method: 'DELETE' });
}
