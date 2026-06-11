import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, MessageType, PlanType, Prisma, SenderType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import {
  getEstimatedDelivery,
  getMessageCost,
} from '../../../shared/constants/message-costs';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessagesRepository } from '../repositories/messages.repository';
import { MessageQueueService } from './message-queue.service';

@Injectable()
export class SendMessageService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageQueue: MessageQueueService,
    private readonly recordTransaction: RecordTransactionService,
    private readonly i18n: I18nService,
  ) {}

  async execute(client: Client, dto: SendMessageDto) {
    if (!dto.conversationId && !dto.recipientId) {
      throw new BadRequestException(
        this.i18n.t('messages.CONVERSATION_OR_RECIPIENT_REQUIRED'),
      );
    }

    const cost = getMessageCost(dto.priority);
    const estimatedDelivery = getEstimatedDelivery(dto.priority);

    const result = await this.messagesRepository.runTransaction(async (tx) => {
      const currentClient = await this.messagesRepository.findClientOrThrow(
        tx,
        client.id,
      );

      this.validateBalance(currentClient, cost);

      const conversation = await this.resolveConversation(
        tx,
        currentClient.id,
        dto,
      );

      const updatedClient = await this.debitClient(tx, currentClient, cost);

      const transactionType =
        currentClient.planType === PlanType.prepaid
          ? TransactionType.debit
          : TransactionType.postpaid_charge;

      const message = await this.messagesRepository.createMessage(tx, {
        conversationId: conversation.id,
        content: dto.content,
        priority: dto.priority,
        cost,
        sentById: currentClient.id,
        sentByType: SenderType.client,
        estimatedDelivery,
        type: dto.type ?? MessageType.whatsapp,
      });

      await this.messagesRepository.touchConversation(tx, conversation.id);

      await this.recordTransaction.executeWithTx(tx, {
        clientId: currentClient.id,
        type: transactionType,
        amount: cost,
        description: this.recordTransaction.buildDescription(
          transactionType,
          dto.priority,
        ),
        balanceAfter:
          currentClient.planType === PlanType.prepaid
            ? updatedClient.balance
            : undefined,
        messageId: message.id,
      });

      return { message, updatedClient };
    });

    this.messageQueue.enqueue(result.message.id, dto.priority);

    return {
      id: result.message.id,
      status: 'queued' as const,
      timestamp: result.message.timestamp.toISOString(),
      estimatedDelivery: result.message.estimatedDelivery!.toISOString(),
      cost: result.message.cost,
      currentBalance:
        result.updatedClient.planType === PlanType.prepaid
          ? result.updatedClient.balance
          : undefined,
    };
  }

  private validateBalance(client: Client, cost: number) {
    if (client.planType === PlanType.prepaid) {
      if (client.balance < cost) {
        throw new HttpException(
          this.i18n.t('messages.INSUFFICIENT_BALANCE'),
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      return;
    }

    if (client.monthlyUsage + cost > client.limit) {
      throw new HttpException(
        this.i18n.t('messages.LIMIT_EXCEEDED'),
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private async debitClient(
    tx: Prisma.TransactionClient,
    client: Client,
    cost: number,
  ) {
    if (client.planType === PlanType.prepaid) {
      return this.messagesRepository.debitPrepaidBalance(tx, client.id, cost);
    }

    return this.messagesRepository.incrementPostpaidUsage(
      tx,
      client.id,
      cost,
    );
  }

  private async resolveConversation(
    tx: Prisma.TransactionClient,
    clientId: string,
    dto: SendMessageDto,
  ) {
    if (dto.conversationId) {
      const conversation =
        await this.messagesRepository.findConversationByIdAndClientId(
          tx,
          dto.conversationId,
          clientId,
        );

      if (!conversation) {
        throw new NotFoundException(
          this.i18n.t('messages.CONVERSATION_NOT_FOUND'),
        );
      }

      return conversation;
    }

    const recipient = await this.messagesRepository.findRecipientById(
      tx,
      dto.recipientId!,
    );

    if (!recipient) {
      throw new NotFoundException(this.i18n.t('messages.RECIPIENT_NOT_FOUND'));
    }

    return this.messagesRepository.upsertConversation(
      tx,
      clientId,
      recipient.id,
    );
  }
}
