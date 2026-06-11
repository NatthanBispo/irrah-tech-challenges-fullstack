-- Converte valores monetários de reais (DECIMAL) para centavos (INTEGER)
ALTER TABLE "clients"
  ALTER COLUMN "balance" TYPE INTEGER USING ROUND("balance" * 100)::INTEGER,
  ALTER COLUMN "limit" TYPE INTEGER USING ROUND("limit" * 100)::INTEGER,
  ALTER COLUMN "monthlyUsage" TYPE INTEGER USING ROUND("monthlyUsage" * 100)::INTEGER;

ALTER TABLE "messages"
  ALTER COLUMN "cost" TYPE INTEGER USING ROUND("cost" * 100)::INTEGER;
