import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConversationsRepository } from '../repositories/conversations.repository';

@Injectable()
export class ListMessagesService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(clientId: string, conversationId: string) {
    const conversation =
      await this.conversationsRepository.findByIdAndClientId(
        conversationId,
        clientId,
      );

    if (!conversation) {
      throw new NotFoundException(
        this.i18n.t('conversations.CONVERSATION_NOT_FOUND'),
      );
    }

    const messages =
      await this.conversationsRepository.findMessagesByConversationId(
        conversationId,
      );

    if (conversation.unreadCount > 0) {
      await this.conversationsRepository.markIncomingAsRead(conversationId);
      await this.conversationsRepository.resetUnreadCount(conversationId);
    }

    return messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      sentBy: {
        id: message.sentById,
        type: message.sentByType,
      },
      timestamp: message.timestamp.toISOString(),
      priority: message.priority,
      status: message.status,
      cost: message.cost,
      type: message.type,
    }));
  }
}
