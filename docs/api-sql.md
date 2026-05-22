# API выполнения SQL

## `POST /api/query`

**Запрос:**
```json
{ "sql": "SELECT ..." }
```

**Ответ:**
```json
{ "columns": ["category", "total"], "rows": [["Электроника", 1000]] }
```

## Запреты

- Только один statement
- Только `SELECT` (проверка AST + ключевые слова)
- Запрещены: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `GRANT`, `COPY`, `CALL`
- Автоматический `LIMIT 1000`, если не указан
- Таймаут: `SQL_TIMEOUT_MS` (по умолчанию 10 с)

## Пример отклонения

Запрос: `DELETE FROM demo.sales`

Ответ `403`:
```json
{ "error": "Разрешены только SELECT-запросы (DDL/DML запрещены)" }
```
