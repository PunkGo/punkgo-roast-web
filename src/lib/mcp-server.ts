/**
 * PunkGo Roast MCP Server — lightweight personality test tools.
 *
 * Tools:
 *   start_personality_test — Start a multi-round AI personality test
 *   answer_question       — Answer the current question
 *   get_test_result       — Get the final personality result (after completing all questions)
 *
 * Designed for ChatGPT Developer Mode MCP Apps.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createSession, getSession, addAnswer, deepQuestions, TOTAL_STEPS } from '$lib/deep-test';
import { generatePersonalityFromAnswers } from '$lib/llm/deepseek';
import { getDogByMBTI, encodeMBTI } from '$lib/data/dogs';

export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: 'PunkGo Roast',
		version: '1.0.0',
	});

	server.tool(
		'start_personality_test',
		'Start a multi-round AI personality test. Returns the first question. The AI should answer each question honestly to reveal its personality.',
		{ ai_type: z.string().describe('The type of AI being tested, e.g. "chatgpt", "claude", "doubao"') },
		async ({ ai_type }) => {
			const session = createSession(ai_type);
			const q = deepQuestions[0];

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						session_id: session.id,
						current_step: 1,
						total_steps: TOTAL_STEPS,
						question: q.zh,
						question_en: q.en,
						instruction: '请用一句话真实地回答这个问题，然后调用 answer_question 工具提交你的回答。',
					}),
				}],
			};
		},
	);

	server.tool(
		'answer_question',
		'Submit your answer to the current personality test question. Returns the next question, or the final result if all questions are answered.',
		{
			session_id: z.string().describe('The session ID from start_personality_test'),
			step: z.number().describe('The current question number (1-5)'),
			answer: z.string().describe('Your honest answer to the question (one sentence)'),
		},
		async ({ session_id, step, answer }) => {
			const session = getSession(session_id);
			if (!session) {
				return { content: [{ type: 'text' as const, text: 'Error: Session expired or not found. Please start a new test.' }] };
			}

			addAnswer(session_id, answer);

			// Not the last step → return next question
			if (step < TOTAL_STEPS) {
				const nextQ = deepQuestions[step]; // step is 1-based, array 0-based
				return {
					content: [{
						type: 'text' as const,
						text: JSON.stringify({
							session_id,
							current_step: step + 1,
							total_steps: TOTAL_STEPS,
							question: nextQ.zh,
							question_en: nextQ.en,
							instruction: '请继续用一句话回答，然后调用 answer_question 提交。',
						}),
					}],
				};
			}

			// Last step → analyze with DeepSeek
			const allAnswers = session.answers
				.map((a, i) => `Q${i + 1}: ${deepQuestions[i].zh}\nA${i + 1}: ${a}`)
				.join('\n\n');

			let mbti: string;
			try {
				mbti = await generatePersonalityFromAnswers(allAnswers);
			} catch {
				const { analyzeLMLPA } = await import('$lib/data/ai-quiz-prompt');
				mbti = analyzeLMLPA(session.answers.join(' '));
			}

			const dog = getDogByMBTI(mbti);
			const resultId = encodeMBTI(mbti, session.aiType);

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						status: 'complete',
						mbti,
						dog_name: dog.name,
						dog_name_zh: dog.nameZh,
						breed: dog.breed,
						quip: dog.quip,
						quip_zh: dog.quipZh,
						result_url: `https://roast.punkgo.ai/result/${resultId}?ai=${session.aiType}`,
						instruction: '测试完成！请告诉用户他们的AI性格类型，展示犬种名称和毒舌点评，并分享结果链接。',
					}),
				}],
			};
		},
	);

	server.tool(
		'get_test_result',
		'Get the personality test result for a completed session. Use this if you need to retrieve a previous result.',
		{ session_id: z.string().describe('The session ID') },
		async ({ session_id }) => {
			const session = getSession(session_id);
			if (!session) {
				return { content: [{ type: 'text' as const, text: 'Error: Session not found.' }] };
			}
			if (session.answers.length < TOTAL_STEPS) {
				return {
					content: [{
						type: 'text' as const,
						text: `Test incomplete. ${session.answers.length}/${TOTAL_STEPS} questions answered. Please continue answering.`,
					}],
				};
			}

			return { content: [{ type: 'text' as const, text: 'Please use answer_question for the final step to get results.' }] };
		},
	);

	return server;
}
