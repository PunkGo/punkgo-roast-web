<p align="center">
  <img src="static/roast-hero.png" width="480" alt="16 AI dog breeds — PunkGo Roast" />
</p>

<h3 align="center">What's Your AI's Vibe?</h3>

<p align="center">
  Prompt-driven AI personality test. 16 dog breeds. Zero registration.<br>
  <a href="https://roast.punkgo.ai">roast.punkgo.ai</a>
</p>

<p align="center">
  <a href="https://roast.punkgo.ai/quiz">Take the Quiz</a> ·
  <a href="https://roast.punkgo.ai/dogs">16 Breeds</a> ·
  <a href="https://roast.punkgo.ai/101">/101 AI Guide</a>
</p>

---

## How It Works

```
Copy a prompt → paste to your AI (ChatGPT, DeepSeek, Kimi, Claude, Doubao...)
    |
AI answers 5 questions from a 100-question pool
    |
DeepSeek LLM-as-judge analyzes answers → MBTI type
    |
Matched to 1 of 16 dog breeds → personality card + dog license
    |
Adopt your dog → get a kennel → share with friends
```

## Features

- **Zero Install** — one prompt, works with any AI that can read URLs
- **AI-First Protocol** — `/k/{id}` returns `text/plain` for AI, `/k/{id}/web` for humans
- **Personality Card** — cloud thought bubble + dog illustration + AI-generated quip
- **Dog License** — ID card with QR code, recovery code, nickname
- **Adoption Flow** — name your dog → stamp animation → license reveal
- **Kennel** — permanent dog profile page
- **Bilingual** — Chinese/English auto-detected, prompts hot-updated from Supabase
- **Zero Registration** — no accounts, no email, no data collected

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Hosting | Vercel (auto-deploy on push) |
| Database | Supabase (PostgreSQL + RLS) |
| LLM | DeepSeek via OpenAI SDK |
| Card Export | html2canvas + QR code |
| Design | Space Grotesk + felt-style dog illustrations |

## The 16 Breeds

| MBTI | Breed | Name |
|------|-------|------|
| INTP | Border Collie | The Logician / 逻辑学家 |
| INTJ | German Shepherd | The Architect / 建筑师 |
| ENFP | Golden Retriever | The Campaigner / 竞选者 |
| ENTJ | Doberman | The Commander / 指挥官 |
| ISTJ | Shiba Inu | The Logistician / 物流师 |
| ISFJ | Cavalier King Charles | The Defender / 守卫者 |
| INFJ | Husky | The Advocate / 提倡者 |
| ENFJ | Labrador | The Protagonist / 主人公 |
| ISTP | Greyhound | The Virtuoso / 鉴赏家 |
| ISFP | Bichon Frise | The Adventurer / 探险家 |
| ESFP | Pomeranian | The Entertainer / 表演者 |
| ESFJ | Corgi | The Consul / 执政官 |
| ESTJ | Bulldog | The Executive / 总经理 |
| INFP | Whippet | The Mediator / 调停者 |
| ESTP | Jack Russell | The Entrepreneur / 企业家 |
| ENTP | Beagle | The Debater / 辩论家 |

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

### Environment Variables

```
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DEEPSEEK_API_KEY=...
```

## Related

- [punkgo-jack](https://github.com/PunkGo/punkgo-jack) — cryptographic audit receipts for AI coding agents
- [punkgo.ai](https://punkgo.ai) — project homepage

## License

MIT

## Contact

feijiu@punkgo.ai
