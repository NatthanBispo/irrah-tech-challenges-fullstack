-- Clientes existentes não possuem senha; limpar antes de adicionar coluna obrigatória.
DELETE FROM "clients";

ALTER TABLE "clients" ADD COLUMN "passwordHash" TEXT NOT NULL;
