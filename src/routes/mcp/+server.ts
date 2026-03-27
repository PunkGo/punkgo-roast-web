/**
 * MCP endpoint for ChatGPT Developer Mode.
 *
 * ChatGPT connects to: https://roast.punkgo.ai/mcp
 * Transport: Web Standard Streamable HTTP (stateless, serverless-friendly)
 */

import type { RequestHandler } from './$types';
import { createMcpServer } from '$lib/mcp-server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const server = createMcpServer();
		const transport = new WebStandardStreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
			enableJsonResponse: true,
		});

		await server.connect(transport);

		const body = await request.json();
		return await transport.handleRequest(request, { parsedBody: body });
	} catch (e) {
		console.error('[mcp] error:', e);
		return new Response(JSON.stringify({ error: String(e) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// Health check / server info
export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({
		name: 'PunkGo Roast MCP Server',
		version: '1.0.0',
		description: 'Multi-round AI personality test. Discover your AI\'s MBTI personality type.',
		tools: ['start_personality_test', 'answer_question', 'get_test_result'],
		transport: 'streamable-http',
		endpoint: 'POST /mcp',
	}), {
		headers: { 'Content-Type': 'application/json' },
	});
};
