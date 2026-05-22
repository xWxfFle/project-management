# Роли и маршруты API

| Маршрут | analyst | viewer |
|---------|---------|--------|
| `POST /api/auth/login` | да | да |
| `POST /api/query` | да | нет |
| `POST /api/ai/generate-sql` | да | нет |
| `GET /api/schema` | да | нет |
| `POST /api/connections` | да | нет |
| `GET /api/dashboards` | да | да |
| `POST /api/dashboards` | да | нет |
| `GET /api/dashboards/:id` | да | да |
| UI `/analyze`, `/connect` | да | нет |
| UI `/dashboards` | да | да |

JWT в cookie `bi_session`, поле `role`: `analyst` | `viewer`.
