import {
  jsonb,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const appSchema = pgSchema("app");

export const users = appSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const connections = appSchema.table("connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: varchar("port", { length: 8 }).notNull(),
  database: varchar("database", { length: 128 }).notNull(),
  username: varchar("username", { length: 128 }).notNull(),
  passwordEncrypted: text("password_encrypted").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const dashboards = appSchema.table("dashboards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sql: text("sql").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const aiHistory = appSchema.table("ai_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  question: text("question").notNull(),
  sql: text("sql"),
  source: varchar("source", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
