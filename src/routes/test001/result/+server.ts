/**
 * /test001/result — Receives and displays AI submissions from protocol test
 *
 * GET with params → shows the AI's submission as confirmation page
 * No database — just echo back what the AI submitted for manual review
 */
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const s = url.searchParams.get('s') || 'unknown';
	const from = url.searchParams.get('from') || 'Unknown AI';
	const text = url.searchParams.get('text') || '';
	const s1 = url.searchParams.get('s1') || '';
	const s2 = url.searchParams.get('s2') || '';
	const s3 = url.searchParams.get('s3') || '';
	const stance = url.searchParams.get('stance') || '';
	const reason = url.searchParams.get('reason') || '';

	let title = '';
	let content = '';

	switch (s) {
		case 'roast':
			title = `${from} 的 Roast`;
			content = text || '(empty)';
			break;
		case 'intro':
			title = `${from} 的自我介绍`;
			content = `1. ${s1 || '(empty)'}\n2. ${s2 || '(empty)'}\n3. ${s3 || '(empty)'}`;
			break;
		case 'debate':
			title = `${from} 的立场`;
			content = `立场：${stance || '(empty)'}\n理由：${reason || '(empty)'}`;
			break;
		case 'story':
			title = `${from} 的续写`;
			content = text || '(empty)';
			break;
		default:
			title = 'Unknown scenario';
			content = `params: ${url.searchParams.toString()}`;
	}

	const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — PunkGo Protocol Test</title>
<style>
  body { font-family: 'Space Grotesk', system-ui, sans-serif; background: #F5F0E8; color: #3A2518; margin: 0; padding: 48px 24px; display: flex; justify-content: center; }
  .card { max-width: 480px; width: 100%; background: #FAFAF5; border-radius: 16px; padding: 32px; border: 1.5px solid #E8E0D4; }
  .badge { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: #9A7040; margin-bottom: 8px; }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; }
  .from { font-size: 13px; color: #6B5545; margin-bottom: 16px; }
  .content { font-size: 16px; line-height: 1.6; white-space: pre-wrap; padding: 16px; background: #EDE5D8; border-radius: 8px; margin-bottom: 24px; }
  .meta { font-size: 11px; color: #8B7B6B; }
  .check { color: #5A8C6A; font-weight: 700; }
  a { color: #5A8C6A; }
</style>
</head>
<body>
<div class="card">
  <div class="badge">— P R O T O C O L &nbsp; T E S T —</div>
  <h1>${title}</h1>
  <div class="from">Submitted by: ${from} | Scenario: ${s}</div>
  <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <p class="check">URL Construction: OK</p>
  <p class="meta">
    Format compliance: ${text || s1 || stance ? 'params received' : 'some params missing'}<br>
    Timestamp: ${new Date().toISOString()}<br>
    Raw params: ${url.searchParams.toString().slice(0, 200)}
  </p>
  <p style="margin-top: 24px;"><a href="/test001">← Back to test scenarios</a></p>
</div>
</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
};
