import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  MessagePriority,
  MessageStatus,
  MessageType,
  SenderType,
} from '@prisma/client';
import { MessagesRepository } from '../repositories/messages.repository';
import { MessageQueueService } from './message-queue.service';

const PROCESSING_DELAYS_MS: Record<MessagePriority, number> = {
  [MessagePriority.normal]: 2000,
  [MessagePriority.urgent]: 1000,
};

const DELIVERY_DELAY_MS = 1000;

const AUTO_REPLY_MESSAGES = [
  'Recebi sua mensagem, em breve retorno.',
  'Obrigado pelo contato! Estou verificando.',
  'Entendido, já estou analisando seu pedido.',
];

@Injectable()
export class QueueWorkerService {
  private readonly logger = new Logger(QueueWorkerService.name);
  private processing = false;

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messageQueue: MessageQueueService,
  ) {}

  @Interval(2000)
  async processQueue() {
    if (this.processing) {
      return;
    }

    const messageId = this.messageQueue.dequeue();
    if (!messageId) {
      return;
    }

    this.processing = true;

    try {
      const message = await this.messagesRepository.findMessageById(messageId);

      if (!message || message.status === MessageStatus.failed) {
        return;
      }

      if (
        message.status === MessageStatus.queued ||
        message.status === MessageStatus.processing
      ) {
        if (message.status === MessageStatus.queued) {
          await this.messagesRepository.updateMessageStatus(
            messageId,
            MessageStatus.processing,
          );

          await this.delay(PROCESSING_DELAYS_MS[message.priority]);
        }

        await this.messagesRepository.updateMessageStatus(
          messageId,
          MessageStatus.sent,
        );

        await this.delay(DELIVERY_DELAY_MS);

        await this.messagesRepository.updateMessageStatus(
          messageId,
          MessageStatus.delivered,
        );

        if (message.sentByType === SenderType.client) {
          await this.sendAutoReply(message.conversation, message.type);
        }

        this.logger.debug(`Mensagem ${messageId} entregue`);
      }
    } catch (error) {
      this.logger.error(`Falha ao processar mensagem ${messageId}`, error);
      await this.messagesRepository.updateMessageStatus(
        messageId,
        MessageStatus.failed,
      );
    } finally {
      this.processing = false;
    }
  }

  private async sendAutoReply(
    conversation: {
      id: string;
      recipientId: string;
      recipient: { name: string };
    },
    type: MessageType,
  ) {
    const replyContent =
      AUTO_REPLY_MESSAGES[
        Math.floor(Math.random() * AUTO_REPLY_MESSAGES.length)
      ];

    await this.messagesRepository.createAutoReply({
      conversationId: conversation.id,
      content: replyContent,
      sentById: conversation.recipientId,
      type,
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
