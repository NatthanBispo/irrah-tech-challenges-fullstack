import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { TransactionsRepository } from '../repositories/transactions.repository';

@Injectable()
export class ListTransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(
    clientId: string,
    filters?: {
      type?: TransactionType;
      from?: string;
      to?: string;
    },
  ) {
    const transactions = await this.transactionsRepository.findByClientId(
      clientId,
      {
        type: filters?.type,
        from: filters?.from ? new Date(filters.from) : undefined,
        to: filters?.to ? new Date(filters.to) : undefined,
      },
    );

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      balanceAfter: t.balanceAfter,
      messageId: t.messageId,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}
