import { Module } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { TransactionsModule } from '../transactions/transactions.module';
import { MessagesController } from './controllers/messages.controller';
import { MessagesGateway } from './gateways/messages.gateway';
import { MessagesRepository } from './repositories/messages.repository';
import { MessageQueueService } from './services/message-queue.service';
import { QueueWorkerService } from './services/queue-worker.service';
import { SendMessageService } from './services/send-message.service';

@Module({
  imports: [TransactionsModule],
  controllers: [MessagesController],
  providers: [
    SendMessageService,
    MessageQueueService,
    QueueWorkerService,
    MessagesRepository,
    MessagesGateway,
    AuthGuard,
  ],
  exports: [MessageQueueService],
})
export class MessagesModule {}
