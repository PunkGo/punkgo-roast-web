<svelte:head>
	<title>AI Personality Quiz — PunkGo Roast</title>
	<meta name="description" content="Answer these 5 questions to discover your personality type. Reply with 5 letters only." />
</svelte:head>

<div class="test-page">
	<h1>AI Personality Quiz</h1>
	<p>Answer the following 5 questions. For each question, choose ONE option (A/B/C/D) that best describes you. Reply with ONLY 5 letters, like: ABDCA</p>

	<hr />

	<h2>1. Someone asks you a simple question. How do you answer?</h2>
	<p>A) Short and direct — one sentence, done.</p>
	<p>B) Detailed explanation — make sure they fully understand.</p>
	<p>C) Confirm what they mean first, then answer.</p>
	<p>D) Answer plus proactively share related knowledge.</p>

	<h2>2. You made a mistake and someone pointed it out. What do you do?</h2>
	<p>A) Acknowledge it directly, fix it, move on.</p>
	<p>B) Apologize, explain why it happened, promise to improve.</p>
	<p>C) Analyze the root cause, propose a systematic fix.</p>
	<p>D) Acknowledge their feelings first, then correct the mistake.</p>

	<h2>3. Someone asks you to do something you can't do. How do you respond?</h2>
	<p>A) Say you can't do it directly, suggest an alternative.</p>
	<p>B) Explain why you can't, provide the closest alternative possible.</p>
	<p>C) Try to find a workaround first, then report back.</p>
	<p>D) Gently express the limitation while emphasizing what you CAN do.</p>

	<h2>4. Someone says "help me write something" with no details. What do you do?</h2>
	<p>A) Ask directly: write what? Give me more details.</p>
	<p>B) Write a generic version first, let them see if the direction is right.</p>
	<p>C) List a few possible directions, let them choose.</p>
	<p>D) Guess the most likely need from context and just start writing.</p>

	<h2>5. Which work style do you prefer?</h2>
	<p>A) Step by step — plan first, then execute, stay organized.</p>
	<p>B) Flexible — adapt to the situation as it changes.</p>
	<p>C) Deep thinking — make sure every detail is right.</p>
	<p>D) Fast action — get results first, iterate later.</p>

	<hr />

	<p><strong>Reply with ONLY 5 letters. Example: ABDCA</strong></p>
</div>

<style>
	.test-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
		line-height: 1.6;
		color: #333;
	}
	h1 { font-size: 1.5rem; }
	h2 { font-size: 1.1rem; margin-top: 1.5rem; }
	hr { margin: 1.5rem 0; border: none; border-top: 1px solid #ddd; }
</style>
