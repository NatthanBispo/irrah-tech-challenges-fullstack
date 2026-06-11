-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('sms', 'whatsapp');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('debit', 'credit', 'postpaid_charge', 'plan_conversion_credit', 'postpaid_settlement');

-- AlterTable: add type to messages
ALTER TABLE "messages" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'whatsapp';

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "balanceAfter" INTEGER,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_clientId_createdAt_idx" ON "transactions"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
