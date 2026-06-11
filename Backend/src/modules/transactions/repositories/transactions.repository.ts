import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

export interface CreateTransactionData {
  clientId: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfter?: number;
  messageId?: string;
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTransactionData) {
    return this.prisma.transaction.create({ data });
  }

  createWithTx(tx: Prisma.TransactionClient, data: CreateTransactionData) {
    return tx.transaction.create({ data });
  }

  findByClientId(
    clientId: string,
    filters?: {
      type?: TransactionType;
      from?: Date;
      to?: Date;
    },
  ) {
    return this.prisma.transaction.findMany({
      where: {
        clientId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.from || filters?.to
          ? {
              createdAt: {
                ...(filters.from && { gte: filters.from }),
                ...(filters.to && { lte: filters.to }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
