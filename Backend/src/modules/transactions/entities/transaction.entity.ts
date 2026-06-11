export interface TransactionEntity {
  id: string;
  clientId: string;
  type: string;
  amount: number;
  description: string;
  balanceAfter?: number | null;
  messageId?: string | null;
  createdAt: Date;
}
