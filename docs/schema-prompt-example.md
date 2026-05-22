# Метаданные схемы для промпта ИИ

Фрагмент, формируемый `GET /api/schema`:

```text
Table demo.categories: id integer, name character varying
Table demo.sales: id integer, category_id integer, amount numeric, sold_at timestamp with time zone
Business terms: "продажи" = SUM(sales.amount), "категория" = categories.name
Business terms: "sales" = SUM(sales.amount), "category" = categories.name
```

Этот текст передаётся в mock/LLM при генерации SQL.
