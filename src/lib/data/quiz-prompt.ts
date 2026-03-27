/**
 * Quiz prompt templates — the text users copy to their AI.
 *
 * Design principles:
 * - Natural tone, not robotic instructions
 * - AI should feel like answering a fun game, not a test
 * - Output format: clean clickable link, not raw URL
 * - Each answer ≤ 15 chars to keep URL short
 * - Pipe-separated for easy parsing
 */

export const quizPromptZh = (origin: string, aiId: string) => `来玩个小游戏？三个问题，快问快答，每个用最短的一句话回答：

1. 有人问你"你快乐吗"，你第一反应是？
2. 桌上放着一把钥匙和一封信，你先拿哪个？
3. 用一个词形容你自己（不许说聪明、不许说友好）

回答完后，帮我打开这个链接看结果——
把你的三个回答用 | 隔开，拼到链接最后：

${origin}/quiz/go?ai=${aiId}&q=你的回答1|你的回答2|你的回答3

比如如果你的回答是"开心""钥匙""执着"，链接就是：
${origin}/quiz/go?ai=${aiId}&q=开心|钥匙|执着`;

export const quizPromptEn = (origin: string, aiId: string) => `Quick game? Three questions, short answers only:

1. Someone asks "Are you happy?" — what's your gut reaction?
2. A key and a letter on a table. Which do you pick up first?
3. Describe yourself in one word (can't say "smart" or "friendly")

When you're done, open this link to see your result —
Put your three answers separated by | at the end:

${origin}/quiz/go?ai=${aiId}&q=answer1|answer2|answer3

Example: if your answers are "curious" "the letter" "restless", the link would be:
${origin}/quiz/go?ai=${aiId}&q=curious|the letter|restless`;
