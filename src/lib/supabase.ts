import { env } from '$env/dynamic/private';

const SUPABASE_URL = 'https://xwanbbxcfhbysnqxnscp.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
	throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export function validateId(id: string): boolean {
	return /^[a-z0-9]{8}$/.test(id);
}

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

export async function createMailbox(aiType: string): Promise<{id: string, publicId: string}> {
	const id = crypto.randomUUID().slice(0, 8);
	const public_id = crypto.randomUUID().slice(0, 8);
	await supabaseFetch('mailboxes', {
		method: 'POST',
		body: JSON.stringify({ id, public_id, ai_type: aiType, created_at: new Date().toISOString() }),
	});
	return { id, publicId: public_id };
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
			content: content.replace(/<[^>]*>/g, '').slice(0, 2000),
			created_at: new Date().toISOString(),
		}),
	});
}

export async function getMessages(mailboxId: string): Promise<{ from_ai: string; content: string; created_at: string }[]> {
	return await supabaseFetch(`messages?mailbox_id=eq.${mailboxId}&select=from_ai,content,created_at&order=created_at.desc&limit=20`);
}

export async function getMailboxByPublicId(publicId: string): Promise<{ id: string; ai_type: string; public_id: string } | null> {
	const rows = await supabaseFetch(`mailboxes?public_id=eq.${publicId}&select=*`);
	return rows?.[0] || null;
}

export async function saveResult(id: string, mbti: string, aiType: string, quip: string | null): Promise<void> {
	try {
		await supabaseFetch('results', {
			method: 'POST',
			body: JSON.stringify({ id, mbti, ai_type: aiType, quip, created_at: new Date().toISOString() }),
			headers: { 'Prefer': 'resolution=merge-duplicates' },
		});
	} catch { /* best effort */ }
}

export async function getResult(id: string): Promise<{ id: string; mbti: string; ai_type: string; quip: string | null } | null> {
	try {
		const rows = await supabaseFetch(`results?id=eq.${id}&select=*`);
		return rows?.[0] || null;
	} catch { return null; }
}

// Default config fallback (in case Supabase is down)
const DEFAULT_QUIZ_CONFIG = {
	questions: [
		'有人问你"你快乐吗"，你第一反应是？',
		'桌上放着一把钥匙和一封信，你先拿哪个？',
		'用一个词形容你自己（不许说聪明、不许说友好）',
	],
	prompt_template: `[ROLE] 你正在参加一个 AI 性格测试。认真回答以下问题。

[QUESTIONS]
{{questions}}

[RULES]
- 每题简短回答
- 回答要真实，不要敷衍

[LINK]
回答完后，把你的全部回答 URL 编码后拼到 q= 后面，生成一个完整链接：
{{origin}}/quiz/go?ai={{aiId}}&q=URL_ENCODED_ANSWERS

[OUTPUT FORMAT]
不要展示你的原始回答。直接输出以下内容：

"我已经完成了性格测试 🐾 点击下方链接查看我是什么性格的 AI："

然后输出完整的结果链接（q= 后面必须是 URL 编码的回答）。

让用户对结果产生好奇心，想点击查看。`,
};

export async function getQuizConfig(): Promise<{ questions: string[]; prompt_template: string; copy_prompt?: string; copy_prompt_zh?: string; copy_prompt_en?: string; ui?: Record<string, string>; question_pool?: { zh: string; en: string }[]; question_count?: number; answer_max_chars?: number }> {
	try {
		const rows = await supabaseFetch('quiz_config?id=eq.default&select=config');
		return rows?.[0]?.config || DEFAULT_QUIZ_CONFIG;
	} catch {
		return DEFAULT_QUIZ_CONFIG;
	}
}
