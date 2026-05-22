CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS demo;

CREATE TABLE IF NOT EXISTS app.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(128) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port VARCHAR(8) NOT NULL,
  database VARCHAR(128) NOT NULL,
  username VARCHAR(128) NOT NULL,
  password_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  sql TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.ai_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  sql TEXT,
  source VARCHAR(32),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS demo.sales (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES demo.categories(id),
  amount NUMERIC(12,2) NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

TRUNCATE demo.sales, demo.categories RESTART IDENTITY CASCADE;

INSERT INTO demo.categories (name) VALUES
  ('Электроника'), ('Одежда'), ('Продукты'), ('Книги'), ('Спорт');

INSERT INTO demo.sales (category_id, amount, sold_at)
SELECT
  (1 + floor(random() * 5))::int,
  round((random() * 9000 + 100)::numeric, 2),
  NOW() - (floor(random() * 120)) * interval '1 day'
FROM generate_series(1, 30);
