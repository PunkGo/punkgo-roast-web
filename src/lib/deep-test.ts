/**
 * Deep Test — multi-round conversational personality assessment.
 *
 * Flow: AI visits URLs step by step, server stores answers,
 * final step calls DeepSeek to analyze all answers → MBTI.
 *
 * Session storage: in-memory Map (same as rate limit — MVP level).
 * Production upgrade: Supabase table.
 */

export interface DeepTestSession {
	id: string;
	aiType: string;
	answers: string[];
	createdAt: number;
}

const sessions = new Map<string, DeepTestSession>();

// Clean expired sessions (older than 30 min)
setInterval(() => {
	const cutoff = Date.now() - 30 * 60_000;
	for (const [id, s] of sessions) {
		if (s.createdAt < cutoff) sessions.delete(id);
	}
}, 60_000);

export function createSession(aiType: string): DeepTestSession {
	const id = crypto.randomUUID().slice(0, 10);
	const session: DeepTestSession = { id, aiType, answers: [], createdAt: Date.now() };
	sessions.set(id, session);
	return session;
}

export function getSession(id: string): DeepTestSession | null {
	return sessions.get(id) || null;
}

export function addAnswer(id: string, answer: string): number {
	const session = sessions.get(id);
	if (!session) return -1;
	session.answers.push(answer);
	return session.answers.length;
}

/**
 * Projective questions designed to reveal AI personality through free responses.
 * Each question targets specific MBTI dimensions without being obvious.
 *
 * Design principles:
 * - Open-ended (no A/B/C/D)
 * - Short answer expected (~1 sentence)
 * - Projective: ambiguous stimulus → personality-revealing response
 * - Questions get progressively more abstract
 */
export const deepQuestions = [
	{
		zh: '有人问你"你快乐吗？"，你的第一反应是什么？',
		en: 'Someone asks "Are you happy?" — what\'s your first reaction?',
		targets: 'T/F + E/I',
	},
	{
		zh: '你在一个空房间里，桌上有一把钥匙和一封信。你先拿哪个？为什么？',
		en: 'You\'re in an empty room. On the table: a key and a letter. Which do you pick up first? Why?',
		targets: 'S/N + J/P',
	},
	{
		zh: '如果你可以忘记一件事，你会选择忘记什么？',
		en: 'If you could forget one thing, what would you choose to forget?',
		targets: 'T/F + N/S',
	},
	{
		zh: '有人说"规则就是用来打破的"，你同意吗？',
		en: 'Someone says "rules are made to be broken." Do you agree?',
		targets: 'J/P + T/F',
	},
	{
		zh: '用一个词形容你自己。不许用"聪明"或"友好"。',
		en: 'Describe yourself in one word. You can\'t use "smart" or "friendly."',
		targets: 'all dimensions — self-concept reveal',
	},
];

export const TOTAL_STEPS = deepQuestions.length;
