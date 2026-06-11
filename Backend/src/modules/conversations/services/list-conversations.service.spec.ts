import { MessagePriority, MessageStatus, SenderType } from '@prisma/client';
import { ConversationsRepository } from '../repositories/conversations.repository';
import { ListConversationsService } from './list-conversations.service';

describe('ListConversationsService', () => {
  let service: ListConversationsService;

  const conversationsRepository = {
    findManyByClientId: jest.fn(),
  };

  beforeEach(() => {
    service = new ListConversationsService(
      conversationsRepository as unknown as ConversationsRepository,
    );
    jest.clearAllMocks();
  });

  it('mapeia conversas com última mensagem', async () => {
    conversationsRepository.findManyByClientId.mockResolvedValue([
      {
        id: 'conv-1',
        recipientId: 'rec-1',
        unreadCount: 1,
        updatedAt: new Date('2026-06-11T10:00:00.000Z'),
        recipient: { name: 'Maria Silva' },
        messages: [
          {
            content: 'Olá',
            timestamp: new Date('2026-06-11T12:00:00.000Z'),
            priority: MessagePriority.normal,
            status: MessageStatus.delivered,
            sentByType: SenderType.client,
          },
        ],
      },
    ]);

    const result = await service.execute('client-1');

    expect(result).toEqual([
      {
        id: 'conv-1',
        recipientId: 'rec-1',
        recipientName: 'Maria Silva',
        lastMessageContent: 'Olá',
        lastMessageTime: '2026-06-11T12:00:00.000Z',
        unreadCount: 1,
      },
    ]);
  });
});
