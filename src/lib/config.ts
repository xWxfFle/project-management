export const config = {
  sqlTimeoutMs: Number(process.env.SQL_TIMEOUT_MS ?? 10000),
  sqlMaxRows: Number(process.env.SQL_MAX_ROWS ?? 1000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  seedSecret: process.env.SEED_SECRET ?? "dev-seed",
  aiProvider: process.env.AI_PROVIDER ?? "mock",
  agentApiKey: process.env.AGENTAPI_KEY ?? "",
  agentApiUrl:
    process.env.AGENTAPI_URL ?? "https://agentapi.ru/v1/chat/completions",
  agentApiModel:
    process.env.AGENTAPI_MODEL ?? "deepseek/deepseek-v4-flash",
};
