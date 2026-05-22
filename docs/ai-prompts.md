# Промпты для AgentAPI (NL → SQL)

## System (RU)

Эксперт PostgreSQL. Только SELECT, одна инструкция, схемы demo/app, LIMIT 100, без markdown в ответе.

## System (EN)

PostgreSQL expert. SELECT only, single statement, demo/app schemas, LIMIT 100, SQL text only.

## Few-shot

В user-сообщение включаются 3 golden-примера из `lib/ai/golden.ts` и актуальная схема из `GET /api/schema`.

## Переключение

- UI `/analyze`: radio Mock / AgentAPI
- `POST /api/ai/generate-sql` body: `{ "mode": "mock" | "agentapi", "lang": "ru" | "en" }`

## Env

```
AGENTAPI_KEY=ваш_ключ
AGENTAPI_URL=https://api.agentapi.ru/v1/ai/chat/completions
AGENTAPI_MODEL=deepseek/deepseek-v4-flash
AI_PROVIDER=agentapi
```

Важно: домен agentapi.ru — это сайт (SPA). API живёт на api.agentapi.ru.
