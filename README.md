# BI Platform — Практическая работа 10

Минимальная BI-платформа: PostgreSQL, NL→SQL (mock), таблица + столбчатый график, роли **analyst** / **viewer**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xWxfFle/project-management)

## Реализовано (10 задач ЛР)

| № | Задача | Реализация |
|---|--------|------------|
| 1 | Сценарии | [docs/user-scenarios.md](docs/user-scenarios.md) |
| 2 | Подключение БД | SELECT-only, `.env.example`, [scripts/seed-demo.sql](scripts/seed-demo.sql) |
| 3 | API SQL | `POST /api/query` — [docs/api-sql.md](docs/api-sql.md) |
| 4 | Метаданные | `GET /api/schema` — [docs/schema-prompt-example.md](docs/schema-prompt-example.md) |
| 5 | LLM | Mock + **AgentAPI** (переключатель на `/analyze`) — [docs/ai-prompts.md](docs/ai-prompts.md) |
| 6 | Валидация | `src/lib/sql-validator.ts` |
| 7 | UI подключения | `/connect` (пароль только на сервере) |
| 8 | Таблица + график | Recharts + [public/sample-result.json](public/sample-result.json) |
| 9 | Роли | JWT — [docs/roles-api-matrix.md](docs/roles-api-matrix.md) |
| 10 | README | этот файл |

## Стек

- Next.js 16 (App Router + API Routes)
- Vercel Postgres (`@vercel/postgres`)
- Drizzle ORM, jose (JWT), bcryptjs, node-sql-parser, Recharts

## Быстрый старт

### 1. Переменные окружения

Скопируйте `.env.example` → `.env.local`:

```bash
POSTGRES_URL=postgresql://...
JWT_SECRET=<openssl rand -hex 32>
ENCRYPTION_KEY=<openssl rand -hex 32>
SEED_SECRET=dev-seed
```

### 2. Seed БД

```bash
npm install
npm run db:seed
```

Или после деплоя на Vercel:

```bash
curl -X POST https://YOUR_APP.vercel.app/api/admin/seed -H "x-seed-secret: dev-seed"
```

### 3. Запуск

```bash
npm run dev
```

Откройте http://localhost:3000

**Демо-пользователи:**

| Email | Пароль | Роль |
|-------|--------|------|
| analyst@demo.local | analyst123 | analyst |
| viewer@demo.local | viewer123 | viewer |

## Деплой на Vercel

1. Import репозитория на [vercel.com/new](https://vercel.com/new)
2. **Storage → Create Database → Postgres** (подставит `POSTGRES_URL`)
3. Добавить `JWT_SECRET`, `ENCRYPTION_KEY`, `SEED_SECRET`
4. Deploy → выполнить seed (см. выше)

## Скриншоты

Добавьте в `docs/screenshots/` после проверки UI:

- `login.png` — вход
- `analyze.png` — NL → SQL → график
- `dashboard.png` — сохранённый дашборд

## Вне объёма ЛР

Drag-n-drop, несколько СУБД, реальный OpenAI, Redis/Celery — не реализованы (см. [docs/report-pr10-outline.md](docs/report-pr10-outline.md)).
