# Отчёт ПР10 — шаблон

## Ход выполнения

1. Инициализация Next.js, Vercel Postgres
2. Seed демо-данных (`categories`, `sales`)
3. API: query, schema, mock AI, dashboards
4. UI: login, analyze, connect, dashboards
5. Документация по 10 задачам ЛР

## Инструменты взаимодействия

- **Git / GitHub** — версионирование
- **Cursor** — разработка с ИИ-ассистентом
- **Vercel** — деплой и Postgres Storage

## Результаты

| Задача | Статус |
|--------|--------|
| 1 Сценарии | docs/user-scenarios.md |
| 2 Подключение БД | SELECT-only, .env, seed |
| 3 API SQL | POST /api/query |
| 4 Метаданные | GET /api/schema |
| 5 LLM mock | golden RU/EN |
| 6 Валидация | sql-validator |
| 7 UI connect | /connect |
| 8 Таблица+график | Recharts + sample-result.json |
| 9 Роли | JWT analyst/viewer |
| 10 README | инструкция запуска |

## Что не получилось / почему

- Реальный LLM — отложен (mock по golden-примерам)
- Drag-n-drop дашбордов — вне объёма ЛР
- Несколько СУБД — не требуется в финальной ЛР
