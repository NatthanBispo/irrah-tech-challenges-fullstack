import { Injectable } from '@nestjs/common';
import { PlanType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DEFAULT_POSTPAID_LIMIT_CENTS } from '../../../shared/utils/money';

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findClientById(clientId: string) {
    return this.prisma.client.findUniqueOrThrow({ where: { id: clientId } });
  }

  incrementBalance(clientId: string, amount: number) {
    return this.prisma.client.update({
      where: { id: clientId },
      data: { balance: { increment: amount } },
    });
  }

  updateLimit(clientId: string, limit: number) {
    return this.prisma.client.update({
      where: { id: clientId },
      data: { limit },
    });
  }

  convertToPrepaid(tx: Prisma.TransactionClient, clientId: string) {
    return tx.client.update({
      where: { id: clientId },
      data: {
        planType: PlanType.prepaid,
        limit: 0,
        monthlyUsage: 0,
      },
    });
  }

  convertToPostpaid(tx: Prisma.TransactionClient, clientId: string) {
    return tx.client.update({
      where: { id: clientId },
      data: {
        planType: PlanType.postpaid,
        balance: 0,
        limit: DEFAULT_POSTPAID_LIMIT_CENTS,
      },
    });
  }

  runTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
