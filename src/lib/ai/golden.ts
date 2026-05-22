export type GoldenExample = {
  keywords: string[];
  sql: string;
  lang: "ru" | "en";
};

export const goldenExamples: GoldenExample[] = [
  {
    lang: "ru",
    keywords: ["продаж", "категор", "квартал"],
    sql: `SELECT c.name AS category, SUM(s.amount) AS total_sales
FROM demo.sales s
JOIN demo.categories c ON c.id = s.category_id
WHERE s.sold_at >= date_trunc('quarter', CURRENT_DATE) - interval '3 months'
  AND s.sold_at < date_trunc('quarter', CURRENT_DATE)
GROUP BY c.name
ORDER BY total_sales DESC
LIMIT 100`,
  },
  {
    lang: "en",
    keywords: ["sales", "categor", "quarter"],
    sql: `SELECT c.name AS category, SUM(s.amount) AS total_sales
FROM demo.sales s
JOIN demo.categories c ON c.id = s.category_id
WHERE s.sold_at >= date_trunc('quarter', CURRENT_DATE) - interval '3 months'
  AND s.sold_at < date_trunc('quarter', CURRENT_DATE)
GROUP BY c.name
ORDER BY total_sales DESC
LIMIT 100`,
  },
  {
    lang: "ru",
    keywords: ["топ", "категор", "продаж"],
    sql: `SELECT c.name AS category, SUM(s.amount) AS total
FROM demo.sales s
JOIN demo.categories c ON c.id = s.category_id
GROUP BY c.name
ORDER BY total DESC
LIMIT 10`,
  },
  {
    lang: "en",
    keywords: ["top", "categor", "sales"],
    sql: `SELECT c.name AS category, SUM(s.amount) AS total
FROM demo.sales s
JOIN demo.categories c ON c.id = s.category_id
GROUP BY c.name
ORDER BY total DESC
LIMIT 10`,
  },
  {
    lang: "ru",
    keywords: ["месяц", "продаж", "сумм"],
    sql: `SELECT date_trunc('month', sold_at) AS month, SUM(amount) AS total
FROM demo.sales
GROUP BY 1
ORDER BY 1 DESC
LIMIT 12`,
  },
];
