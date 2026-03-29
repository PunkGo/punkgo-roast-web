import { supabaseFetch } from './client';

export interface Subject {
	id: string;
	kennel_id: string;
	mailbox_id: string | null;
	public_id: string;
	title: string;
	description: string | null;
	icon: string;
	prompt: string | null;
	creator: string | null;
	created_at: string;
}

/**
 * Get all subjects for a kennel, ordered by creation time.
 * Returns empty array on any error (table may not exist yet).
 */
export async function getSubjectsByKennel(kennelId: string): Promise<Subject[]> {
	try {
		return await supabaseFetch(
			`subjects?kennel_id=eq.${kennelId}&select=*&order=created_at.asc`
		);
	} catch {
		return [];
	}
}

/**
 * Get a subject by its id.
 * Returns null on any error (table may not exist yet).
 */
export async function getSubject(id: string): Promise<Subject | null> {
	try {
		const rows = await supabaseFetch(`subjects?id=eq.${id}&select=*`);
		return rows?.[0] || null;
	} catch {
		return null;
	}
}

/**
 * Get a subject by its public_id (used in /t/[id] routes).
 * Returns null on any error (table may not exist yet).
 */
export async function getSubjectByPublicId(publicId: string): Promise<Subject | null> {
	try {
		const rows = await supabaseFetch(`subjects?public_id=eq.${publicId}&select=*`);
		return rows?.[0] || null;
	} catch {
		return null;
	}
}
