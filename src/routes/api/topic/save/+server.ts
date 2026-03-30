/**
 * POST /api/topic/save — Create or update a topic
 *
 * Body: { recoveryCode, title, prompt, topicId? }
 * - recoveryCode: required for auth (validates kennel ownership)
 * - topicId: if provided, updates existing; otherwise creates new
 */
import type { RequestHandler } from './$types';
import { getKennelByRecoveryCode } from '$lib/supabase';
import { createTopic, getTopic, updateTopic, getTopicsByKennel } from '$lib/supabase';

function generateTopicId(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MAX_TITLE = 100;
const MAX_PROMPT = 2000;
const MAX_TOPICS_PER_KENNEL = 5;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { recoveryCode, title, prompt, topicId } = body;

		if (!recoveryCode || !title?.trim() || !prompt?.trim()) {
			return Response.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Auth: verify recovery code → get kennel
		const kennel = await getKennelByRecoveryCode(recoveryCode);
		if (!kennel) {
			return Response.json({ error: 'Invalid recovery code' }, { status: 403 });
		}

		const cleanTitle = title.trim().slice(0, MAX_TITLE);
		const cleanPrompt = prompt.trim().slice(0, MAX_PROMPT);

		// Update existing topic
		if (topicId) {
			const existing = await getTopic(topicId);
			if (!existing || existing.kennel_id !== kennel.id) {
				return Response.json({ error: 'Topic not found or not yours' }, { status: 404 });
			}
			await updateTopic(topicId, { title: cleanTitle, prompt: cleanPrompt });
			return Response.json({ id: topicId, updated: true });
		}

		// Create new topic — check limit
		const existingTopics = await getTopicsByKennel(kennel.id);
		if (existingTopics.length >= MAX_TOPICS_PER_KENNEL) {
			return Response.json({ error: `Maximum ${MAX_TOPICS_PER_KENNEL} topics per kennel` }, { status: 400 });
		}

		const newId = generateTopicId();
		await createTopic({ id: newId, kennelId: kennel.id, title: cleanTitle, prompt: cleanPrompt });

		return Response.json({ id: newId, created: true });
	} catch (e) {
		console.error('[topic/save]', e);
		return Response.json({ error: 'Server error' }, { status: 500 });
	}
};
