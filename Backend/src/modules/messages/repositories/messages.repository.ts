import { Injectable } from '@nestjs/common';
import {
  MessagePriority,
  MessageStatus,
  MessageType,
  Prisma,
  SenderType,
} from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  runTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  findClientOrThrow(tx: Prisma.TransactionClient, clientId: string) {
    return tx.client.findUniqueOrThrow({ where: { id: clientId } });
  }

  findConversationByIdAndClientId(
    tx: Prisma.TransactionClient,
    conversationId: string,
    clientId: string,
  ) {
    return tx.conversation.findFirst({
      where: { id: conversationId, clientId },
    });
  }

  findRecipientById(tx: Prisma.TransactionClient, recipientId: string) {
    return tx.recipient.findUnique({ where: { id: recipientId } });
  }

  upsertConversation(
    tx: Prisma.TransactionClient,
    clientId: string,
    recipientId: string,
  ) {
    return tx.conversation.upsert({
      where: {
        clientId_recipientId: {
          clientId,
          recipientId,
        },
      },
      update: {},
      create: {
        clientId,
        recipientId,
      },
    });
  }

  debitPrepaidBalance(
    tx: Prisma.TransactionClient,
    clientId: string,
    cost: number,
  ) {
    return tx.client.update({
      where: { id: clientId },
      data: { balance: { decrement: cost } },
    });
  }

  incrementPostpaidUsage(
    tx: Prisma.TransactionClient,
    clientId: string,
    cost: number,
  ) {
    return tx.client.update({
      where: { id: clientId },
      data: { monthlyUsage: { increment: cost } },
    });
  }

  createMessage(
    tx: Prisma.TransactionClient,
    data: {
      conversationId: string;
      content: string;
      priority: MessagePriority;
      cost: number;
      sentById: string;
      sentByType: SenderType;
      estimatedDelivery: Date;
      type?: MessageType;
    },
  ) {
    return tx.message.create({
      data: {
        ...data,
        type: data.type ?? MessageType.whatsapp,
        status: MessageStatus.queued,
      },
    });
  }

  touchConversation(tx: Prisma.TransactionClient, conversationId: string) {
    return tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  resetProcessingMessages() {
    return this.prisma.message.updateMany({
      where: { status: MessageStatus.processing },
      data: { status: MessageStatus.queued },
    });
  }

  findQueuedMessages() {
    return this.prisma.message.findMany({
      where: { status: MessageStatus.queued },
      orderBy: { timestamp: 'asc' },
    });
  }

  findMessageById(messageId: string) {
    return this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: { include: { recipient: true } },
      },
    });
  }

  updateMessageStatus(messageId: string, status: MessageStatus) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }

  createAutoReply(data: {
    conversationId: string;
    content: string;
    sentById: string;
  }) {
    return this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          content: data.content,
          priority: MessagePriority.normal,
          status: MessageStatus.delivered,
          cost: 0,
          sentById: data.sentById,
          sentByType: SenderType.user,
        },
      }),
      this.prisma.conversation.update({
        where: { id: data.conversationId },
        data: {
          unreadCount: { increment: 1 },
          updatedAt: new Date(),
        },
      }),
    ]);
  }
}
