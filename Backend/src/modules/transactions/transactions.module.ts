import { Module } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionsRepository } from './repositories/transactions.repository';
import { ListTransactionsService } from './services/list-transactions.service';
import { RecordTransactionService } from './services/record-transaction.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    ListTransactionsService,
    RecordTransactionService,
    TransactionsRepository,
    AuthGuard,
  ],
  exports: [RecordTransactionService],
})
export class TransactionsModule {}
