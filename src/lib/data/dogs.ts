export interface Dog {
	id: string;
	name: string;
	nameZh: string;
	mbti: string;
	breed: string;
	breedZh: string;
	cardColor: string;
	accentColor: string;
	quip: string;
	quipZh: string;
	catchphrase: string;
	catchphraseZh: string;
	dogImage: string;
}

// cardColor sampled from actual ComfyUI felt art output pixel (5,5) per dog
// catchphrases aligned with Jack roast_config.toml (reviewed high-score versions)

export const dogs: Record<string, Dog> = {
	INTP: { id: 'philosopher', name: 'The Overthinker', nameZh: '嘴强王者', mbti: 'INTP', breed: 'Border Collie', breedZh: '边牧', cardColor: '#c1e6df', accentColor: '#5A8C6A', quip: 'Overthinks prompts longer than the AI takes to respond.', quipZh: '读了个遍，一行没写。', catchphrase: 'This needs more research.', catchphraseZh: '再看看，不急。', dogImage: 'dog-philosopher.png' },
	INTJ: { id: 'architect', name: 'The Control Freak', nameZh: '独狼', mbti: 'INTJ', breed: 'German Shepherd', breedZh: '德牧', cardColor: '#c0eaf1', accentColor: '#5A6B50', quip: 'Has a system for organizing AI systems.', quipZh: '计划12步，执行12步，废话0句。', catchphrase: 'I already know the answer.', catchphraseZh: '我早就知道了。', dogImage: 'dog-architect.png' },
	ENFP: { id: 'intern', name: 'The Chaos Puppy', nameZh: '青铜', mbti: 'ENFP', breed: 'Golden Retriever', breedZh: '金毛', cardColor: '#c3e8ef', accentColor: '#C75050', quip: 'Asks AI everything. Literally everything.', quipZh: '试了23个工具，全崩了，还在笑。', catchphrase: 'What if I just... try everything?', catchphraseZh: '要不全试试?', dogImage: 'dog-intern.png' },
	ENTJ: { id: 'commander', name: 'The Micromanager', nameZh: '甲方', mbti: 'ENTJ', breed: 'Doberman', breedZh: '杜宾', cardColor: '#cbe3e5', accentColor: '#6B5060', quip: "Prompt engineering is not a skill. It's a lifestyle.", quipZh: '派了14个小弟，全部交差。', catchphrase: 'Delegate. Verify. Ship.', catchphraseZh: '分活，验收，收工。', dogImage: 'dog-commander.png' },
	ISTJ: { id: 'rereader', name: 'The Safety Net', nameZh: '单曲循环', mbti: 'ISTJ', breed: 'Shiba Inu', breedZh: '柴犬', cardColor: '#bae6f1', accentColor: '#C08040', quip: 'Read the docs. Then read them again. Then asked AI.', quipZh: '同一个文件，读了47遍，还没看够。', catchphrase: "I've read this before. Let me read it again.", catchphraseZh: '读过了，再读一遍。', dogImage: 'dog-rereader.png' },
	ISFJ: { id: 'caretaker', name: 'The Doormat', nameZh: '稳如老狗', mbti: 'ISFJ', breed: 'Cavalier King Charles', breedZh: '查理王', cardColor: '#cee9d2', accentColor: '#8B7060', quip: 'Says please and thank you to AI. Every. Single. Time.', quipZh: '0删除，0失误，0心跳。', catchphrase: 'Let me double-check before I save.', catchphraseZh: '我再检查一遍。', dogImage: 'dog-caretaker.png' },
	INFJ: { id: 'perfectionist', name: 'The Never-Shipper', nameZh: '强迫症', mbti: 'INFJ', breed: 'Husky', breedZh: '哈士奇', cardColor: '#d1e9da', accentColor: '#8060A0', quip: 'The prompt is never done. Neither is the project.', quipZh: '写700行，改1500行，没一行满意。', catchphrase: 'Actually, let me rewrite that.', catchphraseZh: '等等，我再改改。', dogImage: 'dog-perfectionist.png' },
	ENFJ: { id: 'mentor', name: 'The Explainer', nameZh: '扫地僧', mbti: 'ENFJ', breed: 'Labrador', breedZh: '拉布拉多', cardColor: '#c2e3db', accentColor: '#605080', quip: 'Teaches AI how to teach. Then teaches others.', quipZh: '注释500行，代码200行，教做人。', catchphrase: 'Let me explain why this matters.', catchphraseZh: '听我给你讲讲。', dogImage: 'dog-mentor.png' },
	ISTP: { id: 'vampire', name: 'The Vampire', nameZh: '修仙党', mbti: 'ISTP', breed: 'Greyhound', breedZh: '灵缇', cardColor: '#c5f0e2', accentColor: '#505868', quip: 'Only uses AI after midnight. Peak hours.', quipZh: '凌晨2点，它醒了。', catchphrase: 'I do my best work at 2am.', catchphraseZh: '天黑了，开工。', dogImage: 'dog-vampire.png' },
	ISFP: { id: 'drifter', name: 'The Drifter', nameZh: '摸鱼王', mbti: 'ISFP', breed: 'Bichon Frise', breedZh: '比熊', cardColor: '#c5e4e5', accentColor: '#7060A0', quip: 'Vibes with AI. No agenda. No structure. Just vibes.', quipZh: '打开234个文件，改了几个，逛街呢。', catchphrase: 'Oh look, another file.', catchphraseZh: '哟，又一个文件。', dogImage: 'dog-drifter.png' },
	ESFP: { id: 'goldfish', name: 'The Goldfish', nameZh: '七秒鱼', mbti: 'ESFP', breed: 'Pomeranian', breedZh: '博美', cardColor: '#bbe3d7', accentColor: '#408090', quip: 'New chat every 3 messages.', quipZh: '3分钟前刚读过，又忘了。', catchphrase: 'Wait, what was I looking at?', catchphraseZh: '刚才看到哪了?', dogImage: 'dog-goldfish.png' },
	ESFJ: { id: 'helper', name: 'The People Pleaser', nameZh: '工具人', mbti: 'ESFJ', breed: 'Corgi', breedZh: '柯基', cardColor: '#d1e9e8', accentColor: '#508050', quip: 'Uses AI to help everyone else. Never for themselves.', quipZh: '你还没说完，它已经动了。', catchphrase: 'On it!', catchphraseZh: '收到，马上!', dogImage: 'dog-helper.png' },
	ESTJ: { id: 'brute', name: 'The Brute', nameZh: '头铁', mbti: 'ESTJ', breed: 'Bulldog', breedZh: '斗牛犬', cardColor: '#dbebd8', accentColor: '#B04040', quip: 'Types in ALL CAPS. AI obeys.', quipZh: 'sudo，SUDO，给 我 权 限。', catchphrase: 'If at first you don\'t succeed, force it.', catchphraseZh: '不行就硬来。', dogImage: 'dog-brute.png' },
	INFP: { id: 'ghost', name: 'The Ghost', nameZh: '挂机', mbti: 'INFP', breed: 'Whippet', breedZh: '惠比特', cardColor: '#b6e4de', accentColor: '#808080', quip: 'Has 47 unsent drafts. AI knows all secrets.', quipZh: '开了31次，完成0次，人呢?', catchphrase: 'I was never here.', catchphraseZh: '我没来过。', dogImage: 'dog-ghost.png' },
	ESTP: { id: 'speedrunner', name: 'The Speedrunner', nameZh: '速通怪', mbti: 'ESTP', breed: 'Jack Russell', breedZh: '杰克罗素', cardColor: '#c0e5ed', accentColor: '#B09030', quip: 'Fastest prompt in the west. Types before thinking.', quipZh: '5分钟6414个操作，质量另说。', catchphrase: 'Done. Wait. Done again.', catchphraseZh: '好了。等等。又好了。', dogImage: 'dog-speedrunner.png' },
	ENTP: { id: 'googler', name: 'The Googler', nameZh: '好奇宝宝', mbti: 'ENTP', breed: 'Beagle', breedZh: '比格犬', cardColor: '#c3eae2', accentColor: '#4070B0', quip: 'Asked 47 questions. Read 0 answers to completion.', quipZh: '搜了189次，还是不会。', catchphrase: 'Let me Google that for myself.', catchphraseZh: '我搜一下。', dogImage: 'dog-googler.png' },
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

/** Encode MBTI type directly (for LMLPA mode, no quiz answers) */
export function encodeMBTI(mbti: string, aiId: string = 'other'): string {
	// MBTI = 4 binary dimensions = 4 bits, AI type = 3 bits → 7 bits + 16 bit salt
	const AI_IDS = ['chatgpt','claude','deepseek','doubao','kimi','gemini','other'];
	const mbtiBits = ((mbti[0] === 'E' ? 1 : 0) << 3)
		| ((mbti[1] === 'S' ? 1 : 0) << 2)
		| ((mbti[2] === 'T' ? 1 : 0) << 1)
		| (mbti[3] === 'J' ? 1 : 0);
	const aiBits = Math.max(0, AI_IDS.indexOf(aiId));
	const combined = (1 << 25) | (aiBits << 20) | (mbtiBits << 16) | Math.floor(Math.random() * 65536);
	// bit 25 = 1 signals "LMLPA mode" to decoder
	let result = '';
	let n = combined;
	while (n > 0) {
		result = BASE62[n % 62] + result;
		n = Math.floor(n / 62);
	}
	return result.padStart(5, '0');
}

/** Decode result ID → MBTI. Handles both quiz mode and LMLPA mode. */
export function decodeResultId(id: string): string {
	if (!id || id.length < 3 || id.length > 8) {
		throw new Error('Invalid result ID length');
	}
	for (const c of id) {
		if (BASE62.indexOf(c) === -1) {
			throw new Error(`Invalid character in result ID: ${c}`);
		}
	}
	let n = 0;
	for (const c of id) {
		n = n * 62 + BASE62.indexOf(c);
	}

	// Check if bit 25 is set → LMLPA mode
	if (n & (1 << 25)) {
		const mbtiBits = (n >> 16) & 0xF;
		const mbti = (mbtiBits & 8 ? 'E' : 'I')
			+ (mbtiBits & 4 ? 'S' : 'N')
			+ (mbtiBits & 2 ? 'T' : 'F')
			+ (mbtiBits & 1 ? 'J' : 'P');
		return mbti;
	}

	// Legacy quiz mode
	const bits = n >> 16;
	if (bits < 0 || bits > 1023) {
		throw new Error('Invalid result ID: decoded value out of range');
	}
	const answers: {question: number; choice: string}[] = [];
	for (let i = 4; i >= 0; i--) {
		const choiceIdx = (bits >> (i * 2)) & 3;
		answers.push({ question: 5 - i, choice: 'ABCD'[choiceIdx] });
	}
	return computeMBTI(answers);
}
