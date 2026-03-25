export interface Dog {
	id: string;
	name: string;
	nameZh: string;
	mbti: string;
	breed: string;
	cardColor: string;
	accentColor: string;
	quip: string;
	quipZh: string;
	catchphrase: string;
	catchphraseZh: string;
	dogImage: string;
}

export const dogs: Record<string, Dog> = {
	INTP: { id: 'philosopher', name: 'The Philosopher', nameZh: '哲学家', mbti: 'INTP', breed: 'Border Collie', cardColor: '#E0EFDA', accentColor: '#5A8C6A', quip: 'Overthinks prompts longer than the AI takes to respond.', quipZh: '想 prompt 的时间比 AI 回答还长。', catchphrase: 'Let me think about that for a while.', catchphraseZh: '让我想想。', dogImage: 'dog-philosopher.png' },
	INTJ: { id: 'architect', name: 'The Architect', nameZh: '建筑师', mbti: 'INTJ', breed: 'German Shepherd', cardColor: '#D0D8C4', accentColor: '#5A6B50', quip: 'Has a system for organizing AI systems.', quipZh: '有一套管理 AI 系统的系统。', catchphrase: 'According to my framework...', catchphraseZh: '按照我的框架...', dogImage: 'dog-architect.png' },
	ENFP: { id: 'intern', name: 'The Intern', nameZh: '实习生', mbti: 'ENFP', breed: 'Golden Retriever', cardColor: '#FFE0EC', accentColor: '#C75050', quip: 'Asks AI everything. Literally everything.', quipZh: '什么都问 AI。真的什么都问。', catchphrase: 'Ooh wait can AI do this too?', catchphraseZh: '等等 AI 也能做这个吗？', dogImage: 'dog-intern.png' },
	ENTJ: { id: 'commander', name: 'The Commander', nameZh: '指挥官', mbti: 'ENTJ', breed: 'Doberman', cardColor: '#E8D0D8', accentColor: '#6B5060', quip: "Prompt engineering is not a skill. It's a lifestyle.", quipZh: 'Prompt 工程不是技能，是生活方式。', catchphrase: 'Execute.', catchphraseZh: '执行。', dogImage: 'dog-commander.png' },
	ISTJ: { id: 'rereader', name: 'The Rereader', nameZh: '复读机', mbti: 'ISTJ', breed: 'Shiba Inu', cardColor: '#FFE8D0', accentColor: '#C08040', quip: 'Read the docs. Then read them again. Then asked AI.', quipZh: '看了文档。又看了一遍。然后问了 AI。', catchphrase: 'Per the documentation...', catchphraseZh: '根据文档...', dogImage: 'dog-rereader.png' },
	ISFJ: { id: 'caretaker', name: 'The Caretaker', nameZh: '保姆', mbti: 'ISFJ', breed: 'Cavalier King Charles', cardColor: '#F5E6D8', accentColor: '#8B7060', quip: 'Says please and thank you to AI. Every. Single. Time.', quipZh: '每次都跟 AI 说请和谢谢。每一次。', catchphrase: 'Thank you so much for your help!', catchphraseZh: '非常感谢你的帮助！', dogImage: 'dog-caretaker.png' },
	INFJ: { id: 'perfectionist', name: 'The Perfectionist', nameZh: '完美主义者', mbti: 'INFJ', breed: 'Husky', cardColor: '#E8D8F0', accentColor: '#8060A0', quip: 'The prompt is never done. Neither is the project.', quipZh: 'Prompt 永远没写完。项目也是。', catchphrase: 'Almost perfect. One more iteration.', catchphraseZh: '差不多完美了。再改一版。', dogImage: 'dog-perfectionist.png' },
	ENFJ: { id: 'mentor', name: 'The Mentor', nameZh: '导师', mbti: 'ENFJ', breed: 'Labrador', cardColor: '#D8D0E8', accentColor: '#605080', quip: 'Teaches AI how to teach. Then teaches others.', quipZh: '教 AI 怎么教人。然后教别人。', catchphrase: 'Let me show you a better way.', catchphraseZh: '我教你一个更好的方法。', dogImage: 'dog-mentor.png' },
	ISTP: { id: 'vampire', name: 'The Vampire', nameZh: '吸血鬼', mbti: 'ISTP', breed: 'Greyhound', cardColor: '#D0D4DC', accentColor: '#505868', quip: 'Only uses AI after midnight. Peak hours.', quipZh: '只在午夜后用 AI。黄金时段。', catchphrase: 'The night is young.', catchphraseZh: '夜还长。', dogImage: 'dog-vampire.png' },
	ISFP: { id: 'drifter', name: 'The Drifter', nameZh: '漂流者', mbti: 'ISFP', breed: 'Bichon Frise', cardColor: '#F0E8F8', accentColor: '#7060A0', quip: 'Vibes with AI. No agenda. No structure. Just vibes.', quipZh: '跟 AI 随缘聊。没目标。没结构。只有氛围。', catchphrase: 'Whatever feels right.', catchphraseZh: '随缘吧。', dogImage: 'dog-drifter.png' },
	ESFP: { id: 'goldfish', name: 'The Goldfish', nameZh: '金鱼', mbti: 'ESFP', breed: 'Pomeranian', cardColor: '#D8F0F4', accentColor: '#408090', quip: 'New chat every 3 messages.', quipZh: '每 3 条消息开一个新对话。', catchphrase: 'Wait what were we talking about?', catchphraseZh: '等等我们刚才聊的啥来着？', dogImage: 'dog-goldfish.png' },
	ESFJ: { id: 'helper', name: 'The Helper', nameZh: '热心人', mbti: 'ESFJ', breed: 'Corgi', cardColor: '#E0F0D0', accentColor: '#508050', quip: 'Uses AI to help everyone else. Never for themselves.', quipZh: '用 AI 帮所有人。就是不帮自己。', catchphrase: 'Oh let me look that up for you!', catchphraseZh: '我帮你查一下！', dogImage: 'dog-helper.png' },
	ESTJ: { id: 'brute', name: 'The Brute', nameZh: '莽夫', mbti: 'ESTJ', breed: 'Bulldog', cardColor: '#F4D0C8', accentColor: '#B04040', quip: 'Types in ALL CAPS. AI obeys.', quipZh: '全大写打字。AI 听话照做。', catchphrase: 'JUST DO IT.', catchphraseZh: '做就完了。', dogImage: 'dog-brute.png' },
	INFP: { id: 'ghost', name: 'The Ghost', nameZh: '幽灵', mbti: 'INFP', breed: 'Whippet', cardColor: '#E8E8E8', accentColor: '#808080', quip: 'Has 47 unsent drafts. AI knows all secrets.', quipZh: '有 47 条未发送的草稿。AI 知道所有秘密。', catchphrase: 'Nevermind, forget I asked.', catchphraseZh: '算了，当我没问。', dogImage: 'dog-ghost.png' },
	ESTP: { id: 'speedrunner', name: 'The Speedrunner', nameZh: '速通玩家', mbti: 'ESTP', breed: 'Jack Russell', cardColor: '#FFF0C8', accentColor: '#B09030', quip: 'Fastest prompt in the west. Types before thinking.', quipZh: '西部最快的 prompt。先打字再想。', catchphrase: 'Speed is everything.', catchphraseZh: '速度就是一切。', dogImage: 'dog-speedrunner.png' },
	ENTP: { id: 'googler', name: 'The Googler', nameZh: '搜索怪', mbti: 'ENTP', breed: 'Beagle', cardColor: '#D0E0F4', accentColor: '#4070B0', quip: 'Asked 47 questions. Read 0 answers to completion.', quipZh: '问了 47 个问题。0 个答案看完了。', catchphrase: 'Let me Google that for myself.', catchphraseZh: '我搜一下。', dogImage: 'dog-googler.png' },
};

// MBTI scoring weights per question per choice
export const mbtiMap: Record<number, Record<string, Record<string, number>>> = {
	1: { A: {F:1}, B: {T:1}, C: {E:1}, D: {I:1} },
	2: { A: {J:1}, B: {E:1}, C: {I:1}, D: {P:1} },
	3: { A: {S:0.5,J:0.5}, B: {N:1}, C: {S:0.5,T:0.5}, D: {N:0.5,F:0.5} },
	4: { A: {E:0.5,N:0.5}, B: {I:0.5,T:0.5}, C: {S:0.5,T:0.5}, D: {E:0.5,F:0.5} },
	5: { A: {J:1}, B: {P:0.5,N:0.5}, C: {I:0.5,S:0.5}, D: {P:0.5,E:0.5} },
};

export function computeMBTI(answers: {question: number; choice: string}[]): string {
	const scores: Record<string, number> = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
	for (const a of answers) {
		const dims = mbtiMap[a.question]?.[a.choice] || {};
		for (const [k, v] of Object.entries(dims)) scores[k] += v;
	}
	return (scores.E >= scores.I ? 'E' : 'I')
		+ (scores.S >= scores.N ? 'S' : 'N')
		+ (scores.T >= scores.F ? 'T' : 'F')
		+ (scores.J >= scores.P ? 'J' : 'P');
}

export function getDogByMBTI(mbti: string): Dog {
	return dogs[mbti] || dogs['ENTP'];
}

// Result ID: encode answers (10 bit) + salt (16 bit) → base62
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeResultId(answers: {question: number; choice: string}[]): string {
	// 5 answers × 2 bits = 10 bits
	let bits = 0;
	for (const a of answers) {
		const choiceIdx = 'ABCD'.indexOf(a.choice);
		bits = (bits << 2) | (choiceIdx & 3);
	}
	// 16-bit random salt
	const salt = Math.floor(Math.random() * 65536);
	const combined = (bits << 16) | salt; // 26 bits total
	// base62 encode
	let result = '';
	let n = combined;
	while (n > 0) {
		result = BASE62[n % 62] + result;
		n = Math.floor(n / 62);
	}
	return result.padStart(5, '0');
}

export function decodeResultId(id: string): string {
	// base62 decode
	let n = 0;
	for (const c of id) {
		n = n * 62 + BASE62.indexOf(c);
	}
	// extract top 10 bits (answers), ignore bottom 16 bits (salt)
	const bits = n >> 16;
	const answers: {question: number; choice: string}[] = [];
	for (let i = 4; i >= 0; i--) {
		const choiceIdx = (bits >> (i * 2)) & 3;
		answers.push({ question: 5 - i, choice: 'ABCD'[choiceIdx] });
	}
	return computeMBTI(answers);
}
