import { Injectable } from '@nestjs/common';
import { ConversationListItem } from '../entities/conversation.entity';
import { ConversationsRepository } from '../repositories/conversations.repository';

@Injectable()
export class ListConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async execute(clientId: string): Promise<ConversationListItem[]> {
    const conversations =
      await this.conversationsRepository.findManyByClientId(clientId);

    return conversations.map((conversation) => {
      const lastMessage = conversation.messages[0];

      return {
        id: conversation.id,
        recipientId: conversation.recipientId,
        recipientName: conversation.recipient.name,
        lastMessageContent: lastMessage?.content ?? '',
        lastMessageTime: (
          lastMessage?.timestamp ?? conversation.updatedAt
        ).toISOString(),
        unreadCount: conversation.unreadCount,
      };
    });
  }
}
