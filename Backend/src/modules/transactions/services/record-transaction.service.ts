import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import {
  CreateTransactionData,
  TransactionsRepository,
} from '../repositories/transactions.repository';

@Injectable()
export class RecordTransactionService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  execute(data: CreateTransactionData) {
    return this.transactionsRepository.create(data);
  }

  executeWithTx(tx: Prisma.TransactionClient, data: CreateTransactionData) {
    return this.transactionsRepository.createWithTx(tx, data);
  }

  buildDescription(type: TransactionType, extra?: string): string {
    const map: Record<TransactionType, string> = {
      debit: `Débito por envio de mensagem${extra ? ` (${extra})` : ''}`,
      credit: 'Recarga de saldo',
      postpaid_charge: `Cobrança pós-pago por mensagem${extra ? ` (${extra})` : ''}`,
      plan_conversion_credit: 'Crédito por conversão de plano pré-pago para pós-pago',
      postpaid_settlement: 'Apuração de consumo pós-pago por conversão para pré-pago',
    };
    return map[type];
  }
}
