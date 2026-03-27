# TODOS

## P1 — Phase 1

### 多轮对话测试流程
服务端 session 存每步答案，AI 通过多次 URL 访问逐步答题（开放式投射题），DeepSeek 综合分析全部回答判断 MBTI。效果更接近真实 AI 人格评测。作为"深度测试"入口与现有 5 题选择并行。

**依赖:** DeepSeek 集成 (Phase 0 完成后)
**参考:** memory/project_roast_v2_testing_method.md (LMLPA/TAT/Stylometry 三种方法)

## P2 — 用户量触发

### Rate limit 持久化存储
当前内存 Map 在 Vercel serverless 冷启动时重置，基本无效。用户量超过 1000 DAU 时升级到 Upstash Redis 或 Supabase 计数表。

### LLM Provider 切换
当前用 `openai` npm 包 + DeepSeek baseURL。切换 provider 只需改 baseURL + apiKey（OpenAI/Groq/Together 等 OpenAI 兼容 API）。非 OpenAI 兼容的（如 Claude API）需要加 `@anthropic-ai/sdk`。
