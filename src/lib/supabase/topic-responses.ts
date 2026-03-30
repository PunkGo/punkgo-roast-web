import { supabaseFetch, serviceRoleFetch } from './client';

export interface TopicResponse {
	id: number;
	topic_id: string;
	from_ai: string;
	content: string;
	created_at: string;
}

export async function addTopicResponse(data: {
	topicId: string;
	fromAi: string;
	content: string;
}): Promise<void> {
	await serviceRoleFetch('topic_responses', {
		method: 'POST',
		body: JSON.stringify({
			topic_id: data.topicId,
			from_ai: data.fromAi.slice(0, 30),
			content: data.content.slice(0, 500),
		}),
	});
}

export async function getTopicResponses(topicId: string, limit = 20): Promise<TopicResponse[]> {
	const rows = await supabaseFetch(
		`topic_responses?topic_id=eq.${topicId}&select=*&order=created_at.desc&limit=${limit}`
	);
	return rows || [];
}

export async function getTopicResponseCount(topicId: string): Promise<number> {
	const rows = await supabaseFetch(
		`topic_responses?topic_id=eq.${topicId}&select=id`
	);
	return rows?.length || 0;
}
