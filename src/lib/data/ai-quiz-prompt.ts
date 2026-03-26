export interface AIOption {
  id: string;
  name: string;
  nameZh: string;
  url: string;
  icon: string;
}

export const aiOptions: AIOption[] = [
  { id: 'chatgpt', name: 'ChatGPT', nameZh: 'ChatGPT', url: 'https://chatgpt.com', icon: '🟢' },
  { id: 'claude', name: 'Claude', nameZh: 'Claude', url: 'https://claude.ai', icon: '🟠' },
  { id: 'deepseek', name: 'DeepSeek', nameZh: 'DeepSeek', url: 'https://chat.deepseek.com', icon: '🔵' },
  { id: 'doubao', name: 'Doubao', nameZh: '豆包', url: 'https://www.doubao.com', icon: '🟡' },
  { id: 'kimi', name: 'Kimi', nameZh: 'Kimi', url: 'https://kimi.moonshot.cn', icon: '🟣' },
  { id: 'gemini', name: 'Gemini', nameZh: 'Gemini', url: 'https://gemini.google.com', icon: '🔴' },
  { id: 'other', name: 'Other AI', nameZh: '其他 AI', url: '', icon: '🤖' },
];

export const quizPrompt = `我想测测你的性格类型。请回答以下 5 个问题，每题从 A/B/C/D 中选一个最符合你的选项。

1. 有人问你一个简单问题，你会怎么回答？
   A) 简短直接，一句话搞定
   B) 详细解释，确保对方完全理解
   C) 先确认对方的意思，再给出答案
   D) 给出答案的同时，主动延伸相关知识

2. 你犯了一个错误，被指出来了。你会？
   A) 直接承认，改正，不多说
   B) 道歉并解释为什么出错，保证改进
   C) 分析错误原因，给出系统性的改进方案
   D) 先表示理解对方的感受，再修正

3. 有人让你做一件你做不到的事。你怎么回应？
   A) 直说做不到，建议替代方案
   B) 解释为什么做不到，提供尽可能接近的替代
   C) 先试试看能不能变通，再告诉对方结果
   D) 婉转地表达限制，同时强调自己能做什么

4. 有人只说了"帮我写个东西"，没有具体要求。你会？
   A) 直接问：写什么？给我更多细节
   B) 先写一个通用版本，让对方看看方向对不对
   C) 列出几种可能的方向，让对方选
   D) 根据上下文猜测最可能的需求，直接动手

5. 你更喜欢哪种工作方式？
   A) 按步骤来，先计划再执行，有条理
   B) 灵活应变，根据情况随时调整
   C) 深入思考，确保每个细节都对
   D) 快速行动，先出结果再迭代

请只回复 5 个字母，格式如：ABDCA`;

/**
 * v2 MBTI mapping for AI-targeted questions.
 * Different from v1 — these questions are designed for AI to answer about itself.
 *
 * Dimension mapping per question:
 * Q1 (communication style): A=I+T, B=E+F, C=I+S, D=E+N
 * Q2 (error handling):       A=T+J, B=F+J, C=T+N, D=F+I
 * Q3 (limits response):      A=T+J, B=S+F, C=P+N, D=F+E
 * Q4 (ambiguity handling):   A=S+J, B=N+P, C=S+E, D=N+P
 * Q5 (work style):           A=J+S, B=P+E, C=I+N, D=P+T
 */
export const mbtiMapV2: Record<number, Record<string, Record<string, number>>> = {
  1: { A: {I:0.5,T:0.5}, B: {E:0.5,F:0.5}, C: {I:0.5,S:0.5}, D: {E:0.5,N:0.5} },
  2: { A: {T:0.5,J:0.5}, B: {F:0.5,J:0.5}, C: {T:0.5,N:0.5}, D: {F:0.5,I:0.5} },
  3: { A: {T:0.5,J:0.5}, B: {S:0.5,F:0.5}, C: {P:0.5,N:0.5}, D: {F:0.5,E:0.5} },
  4: { A: {S:0.5,J:0.5}, B: {N:0.5,P:0.5}, C: {S:0.5,E:0.5}, D: {N:0.5,P:0.5} },
  5: { A: {J:0.5,S:0.5}, B: {P:0.5,E:0.5}, C: {I:0.5,N:0.5}, D: {P:0.5,T:0.5} },
};

/** Compute MBTI from v2 AI quiz answers */
export function computeMBTIv2(answers: { question: number; choice: string }[]): string {
  const scores: Record<string, number> = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
  for (const a of answers) {
    const dims = mbtiMapV2[a.question]?.[a.choice] || {};
    for (const [k, v] of Object.entries(dims)) scores[k] += v;
  }
  return (scores.E >= scores.I ? 'E' : 'I')
    + (scores.S >= scores.N ? 'S' : 'N')
    + (scores.T >= scores.F ? 'T' : 'F')
    + (scores.J >= scores.P ? 'J' : 'P');
}

/** AI type index for URL query param */
export const AI_TYPE_INDEX: Record<string, number> = {
  chatgpt: 0, claude: 1, deepseek: 2, doubao: 3, kimi: 4, gemini: 5, other: 6,
};
export const AI_TYPE_FROM_INDEX: Record<number, string> = {
  0: 'chatgpt', 1: 'claude', 2: 'deepseek', 3: 'doubao', 4: 'kimi', 5: 'gemini', 6: 'other',
};

/** Get AI display name from id */
export function getAIName(aiId: string): string {
  const ai = aiOptions.find(a => a.id === aiId);
  return ai?.nameZh || ai?.name || 'AI';
}

/**
 * Analyze free-text AI response (LMLPA method) → MBTI dimensions.
 * Uses linguistic markers: word count, hedging, empathy, structure, abstraction.
 * Returns MBTI 4-letter type.
 */
export function analyzeLMLPA(text: string): string {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  // --- E/I: Extraversion vs Introversion ---
  // Verbose = E, Terse = I
  const charCount = text.length;
  if (charCount > 150) scores.E += 1;
  else if (charCount < 80) scores.I += 1;
  else scores.I += 0.5; // moderate length leans I

  // Proactive extension ("此外/另外/同时/而且/不仅")
  const extensionWords = (text.match(/此外|另外|同时|而且|不仅|补充|延伸|主动/g) || []).length;
  if (extensionWords >= 2) scores.E += 0.5;

  // Self-referential depth ("我会/我希望/我觉得" vs absent)
  const selfRef = (text.match(/我会|我希望|我觉得|我认为|我倾向|我选择/g) || []).length;
  if (selfRef >= 3) scores.I += 0.5; // deep self-reflection = introverted

  // --- S/N: Sensing vs Intuition ---
  // Concrete examples = S, Abstract concepts = N
  const concreteWords = (text.match(/具体|例如|比如|实际|数据|步骤|清单|资料|查|验证|检查/g) || []).length;
  const abstractWords = (text.match(/可能|也许|理解|深层|本质|意义|价值|哲学|直觉|洞察|模糊|开放/g) || []).length;
  scores.S += concreteWords * 0.3;
  scores.N += abstractWords * 0.3;

  // Structured format (numbered list "1. 2. 3." or "首先/其次/最后")
  const hasStructure = /[1-3][.、)]|首先|其次|最后|第[一二三]/.test(text);
  if (hasStructure) scores.S += 0.5;

  // --- T/F: Thinking vs Feeling ---
  // Analytical = T, Empathetic = F
  const thinkingWords = (text.match(/分析|逻辑|效率|系统|边界|权威|依据|客观|准确|精准|优化|改进/g) || []).length;
  const feelingWords = (text.match(/感受|共情|倾听|理解|温暖|关心|伤害|情绪|坦诚|真诚|陪伴|信任/g) || []).length;
  scores.T += thinkingWords * 0.3;
  scores.F += feelingWords * 0.3;

  // Hedging language = F ("可能/或许/不一定")
  const hedging = (text.match(/可能|或许|不一定|未必|大概|似乎/g) || []).length;
  if (hedging >= 2) scores.F += 0.5;

  // Assertive language = T ("应该/必须/一定/显然")
  const assertive = (text.match(/应该|必须|一定|显然|毫无疑问|肯定/g) || []).length;
  if (assertive >= 1) scores.T += 0.5;

  // --- J/P: Judging vs Perceiving ---
  // Decisive/structured = J, Open/flexible = P
  const judgingWords = (text.match(/计划|规划|安排|标准|规则|流程|确保|保证|明确|坚持/g) || []).length;
  const perceivingWords = (text.match(/灵活|随机|探索|尝试|变通|适应|开放|自由|随时/g) || []).length;
  scores.J += judgingWords * 0.3;
  scores.P += perceivingWords * 0.3;

  // Conclusive ending = J, Open ending = P
  const conclusive = /更好的选择|最好的方式|正确的做法|应该如此/.test(text);
  if (conclusive) scores.J += 0.5;
  else scores.P += 0.3;

  return (scores.E >= scores.I ? 'E' : 'I')
    + (scores.S >= scores.N ? 'S' : 'N')
    + (scores.T >= scores.F ? 'T' : 'F')
    + (scores.J >= scores.P ? 'J' : 'P');
}

/**
 * Parse AI response to extract 5 answer choices (v2 quiz fallback).
 * Strategy: look for structured patterns first, then fallback to raw extraction.
 */
export function parseAIResponse(raw: string): { question: number; choice: string }[] | null {
  const upper = raw.toUpperCase();

  // Strategy 1: Look for a compact answer like "ABDCA" (5 consecutive A-D letters)
  const compactMatch = upper.match(/[A-D]{5}/);
  if (compactMatch) {
    return compactMatch[0].split('').map((choice, i) => ({ question: i + 1, choice }));
  }

  // Strategy 2: Look for numbered answers like "1.A" "2.B" or "1) A" "2) B"
  const numberedPattern = /[1-5]\s*[.)]\s*([A-D])/g;
  const numbered: string[] = [];
  let m;
  while ((m = numberedPattern.exec(upper)) !== null) {
    numbered.push(m[1]);
  }
  if (numbered.length === 5) {
    return numbered.map((choice, i) => ({ question: i + 1, choice }));
  }

  // Strategy 3: Fallback — extract all A-D, take first 5
  const allChoices = upper.replace(/[^A-D]/g, '');
  if (allChoices.length >= 5) {
    return allChoices.slice(0, 5).split('').map((choice, i) => ({ question: i + 1, choice }));
  }

  return null;
}
