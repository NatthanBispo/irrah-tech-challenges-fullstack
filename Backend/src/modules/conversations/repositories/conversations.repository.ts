import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class ConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByClientId(clientId: string) {
    return this.prisma.conversation.findMany({
      where: { clientId },
      include: {
        recipient: true,
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findByIdAndClientId(conversationId: string, clientId: string) {
    return this.prisma.conversation.findFirst({
      where: { id: conversationId, clientId },
    });
  }

  findMessagesByConversationId(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    });
  }

  resetUnreadCount(conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
  }

  markIncomingAsRead(conversationId: string) {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        sentByType: 'user',
        status: 'delivered',
      },
      data: { status: 'read' },
    });
  }
}
