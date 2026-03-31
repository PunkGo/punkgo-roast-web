<h3 align="center">P U N K G O &nbsp; R O A S T</h3>

<p align="center">
  The first apps built on <a href="https://github.com/PunkGo/text-plain-prompt-protocol">text/plain prompt protocol</a>.<br>
  One URL. Any AI. Zero install.
</p>

<p align="center">
  <a href="https://roast.punkgo.ai">roast.punkgo.ai</a>
</p>

---

## 🏚️ The Missing Room — AI Mystery Game

<p align="center">
  <img src="static/game/game_hero.jpg" width="600" alt="The Missing Room — AI Mystery Game" />
</p>

A hidden room exists on the blueprints but can't be found in the building. Your AI partner investigates clues, picks what to examine, and makes deductions. You click links to advance the story.

10 rounds. 3 endings. Any AI.

**What happened when we tested it:**
- 3 different AIs (GPT, Doubao) all chose the same "safe" answer on the final deduction. None got the perfect ending.
- Same AI model, same input = identical choice path every time. AI personality is deterministic.
- Kimi completed the entire game autonomously — no human copy-paste needed after the first URL.

<p align="center">
  <a href="https://roast.punkgo.ai/game"><strong>▶ Play Now</strong></a>
</p>

---

## 🐾 AI Vibe Check — Personality Quiz

<p align="center">
  <img src="static/roast-hero.png" width="480" alt="16 AI dog breeds — PunkGo Roast" />
</p>

Send a prompt to any AI. It answers 5 questions. An LLM judge analyzes its personality → MBTI type → one of 16 dog breeds. You get a personality card, a dog license, and a kennel.

100% completion rate across all 5 AIs tested. Bilingual (Chinese/English auto-detected).

<p align="center">
  <a href="https://roast.punkgo.ai/quiz"><strong>▶ Take the Quiz</strong></a>
</p>

---

## How it works

Both apps run on [text/plain prompt protocol](https://github.com/PunkGo/text-plain-prompt-protocol) — a URL returns plain text instructions that any AI reads and follows. No SDK, no API key. The AI reads, reasons, and outputs callback links. The human clicks to advance.

That protocol also powers [Prompt Capsule](https://roast.punkgo.ai/workshop) — write a prompt, compress it into a URL, any AI opens it and acts.

---

## Tech

| | |
|-|-|
| Protocol | [text/plain prompt](https://github.com/PunkGo/text-plain-prompt-protocol) |
| Framework | SvelteKit 2 + Svelte 5 |
| Hosting | Vercel |
| Database | Supabase |
| LLM | DeepSeek (quiz judge) |
| Illustrations | Google Gemini |

```bash
npm install && npm run dev
```

## Related

- [text-plain-prompt-protocol](https://github.com/PunkGo/text-plain-prompt-protocol) — the protocol spec
- [punkgo-jack](https://github.com/PunkGo/punkgo-jack) — cryptographic audit receipts for AI agents
- [punkgo.ai](https://punkgo.ai) — project homepage

## License

MIT · feijiu@punkgo.ai
