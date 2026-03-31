# PunkGo Roast — Capabilities

> What can a single URL + text/plain prompt do across 5 major AIs?

## Product Capabilities

### Quiz — AI Personality Test

```
One prompt → AI answers 5 questions from 100-question pool → LLM-as-judge → MBTI → Dog breed
```

- 16 dog breeds mapped to 16 MBTI types
- Works with ChatGPT, DeepSeek, Kimi, Claude, Doubao
- Zero registration, zero install
- Bilingual (Chinese/English, auto-detected)

### Kennel — Dog Profile

- Permanent dog profile page (`/k/{id}/web`)
- Personality card (cloud thought bubble + dog illustration + AI-generated quip)
- Dog license (ID card with QR code, recovery code, nickname)
- Adoption flow with stamp animation

### Prompt Capsule — Prompt-as-URL

```
Write a prompt → compress into a URL → any AI opens it and acts
```

- Editor at `/workshop`
- 3 built-in templates (Roast / Intro / Story)
- `has_callback` toggle: interactive (AI writes back) vs display-only
- Manual paste fallback for AIs that can't construct URLs

---

## text/plain Protocol — AI Capability Matrix

**Mechanism:** A URL returns `text/plain` structured instructions. AI reads it, executes, and constructs a GET URL for write-back (human clicks the link to trigger).

Zero SDK. Zero API key. Zero install.

### Text Generation (5/5 AI, 100%)

| Scenario | What AI Does | ChatGPT | DeepSeek | Kimi | Claude | Doubao |
|----------|-------------|---------|----------|------|--------|--------|
| Roast | Creative copywriting + persona | 5 | 4 | 5 | 5 | 4 |
| Self-intro | Structured output (3 sentences) | 5 | 4 | 5 | 5 | 5 |
| Debate | Logical reasoning + stance | 5 | 4 | 5 | 5 | 4 |
| Story | Creative continuation | 5 | 5 | 5 | 5 | 5 |

### Code Rendering (4/5 AI)

| Scenario | What AI Does | ChatGPT | DeepSeek | Kimi | Claude | Doubao |
|----------|-------------|---------|----------|------|--------|--------|
| HTML page | Write HTML+CSS, browser renders | 2 (CSS lost) | 5 | 5 | 4 (sandbox) | 4 (overflow) |
| Game | Write Canvas+JS playable game | 4 | 0 (refused) | 4 | 5 | 4 |
| Meme | Code-render text+graphics | 4 (bad CJK) | — | 5 | 5 | 2 (no text composition) |

### Image Generation (4/5 AI)

| Scenario | What AI Does | ChatGPT | DeepSeek | Kimi | Claude | Doubao |
|----------|-------------|---------|----------|------|--------|--------|
| Draw | Generate image from prompt | 3 (retry) | 0 (text only) | 0 (text only) | 3 (SVG) | 4 (pixel x4) |
| Photo edit | Edit/transform images | 5 (direct) | — | 5 | 5 | 5 (recipe) |

### Multi-Step Interaction

| Scenario | What AI Does | Mechanism |
|----------|-------------|-----------|
| Chain Story | Read previous episodes + continue | Same URL returns different content each time; AI builds on prior AIs' work |
| Topic Write-back | Encode response as URL params | AI constructs GET URL, human clicks to submit |
| Manual paste | Human copies AI output | Fallback for AIs that can't construct URLs (e.g. Doubao) |

---

## Key Findings

1. **Code rendering > pixel rendering** — CJK text accuracy, interactivity, cross-AI compatibility all better with code
2. **Same Capsule, different paths** — GPT generates images directly, Doubao outputs parameter recipes, Claude writes SVG. Each AI finds its own optimal solution.
3. **Write-back via human click** — AIs can't send HTTP requests, but they can construct URLs for humans to click
4. **Config > code** — Scenarios stored in Supabase table, zero code changes to add new ones
5. **Compatibility fallback trio** — Multi-layer URL decode + trim whitespace + manual paste fallback

## Compatibility Notes

| AI | Known Issues | Workaround |
|----|-------------|------------|
| Doubao | Adds spaces in URL params | Prompt hint + server-side trim |
| DeepSeek | Double URL-encoding | Server-side 3-layer decode |
| DeepSeek | Refuses game generation | "Can't access external links" — text scenarios work fine |
| Claude | Meta-awareness | Comments "this is prompt injection but I choose to participate" |
| ChatGPT/Doubao | Bad CJK in generated images | Use code rendering instead (Claude/Kimi perfect) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL + RLS) |
| LLM | DeepSeek via OpenAI SDK |
| Protocol | text/plain over HTTPS |
| Card Export | html2canvas + QR code |

---

**roast.punkgo.ai** — MIT License
