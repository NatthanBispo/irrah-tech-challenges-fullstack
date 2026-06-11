import { NotFoundException } from '@nestjs/common';
import { MessagePriority, MessageStatus, SenderType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { ConversationsRepository } from '../repositories/conversations.repository';
import { ListMessagesService } from './list-messages.service';

describe('ListMessagesService', () => {
  let service: ListMessagesService;

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  const conversationsRepository = {
    findByIdAndClientId: jest.fn(),
    findMessagesByConversationId: jest.fn(),
    resetUnreadCount: jest.fn(),
    markIncomingAsRead: jest.fn(),
  };

  beforeEach(() => {
    service = new ListMessagesService(
      conversationsRepository as unknown as ConversationsRepository,
      i18n as unknown as I18nService,
    );
    jest.clearAllMocks();
  });

  it('zera unreadCount e marca mensagens como lidas quando há não lidas', async () => {
    conversationsRepository.findByIdAndClientId.mockResolvedValue({
      id: 'conv-1',
      clientId: 'client-1',
      unreadCount: 2,
    });
    conversationsRepository.findMessagesByConversationId.mockResolvedValue([
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        content: 'Olá',
        sentById: 'user-1',
        sentByType: SenderType.user,
        timestamp: new Date('2026-06-11T12:00:00.000Z'),
        priority: MessagePriority.normal,
        status: MessageStatus.delivered,
        cost: 0,
        type: 'whatsapp',
      },
    ]);
    conversationsRepository.markIncomingAsRead.mockResolvedValue({ count: 1 });

    await service.execute('client-1', 'conv-1');

    expect(conversationsRepository.markIncomingAsRead).toHaveBeenCalledWith('conv-1');
    expect(conversationsRepository.resetUnreadCount).toHaveBeenCalledWith('conv-1');
  });

  it('não atualiza unreadCount quando já está zerado', async () => {
    conversationsRepository.findByIdAndClientId.mockResolvedValue({
      id: 'conv-1',
      clientId: 'client-1',
      unreadCount: 0,
    });
    conversationsRepository.findMessagesByConversationId.mockResolvedValue([]);

    await service.execute('client-1', 'conv-1');

    expect(conversationsRepository.resetUnreadCount).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando conversa não pertence ao cliente', async () => {
    conversationsRepository.findByIdAndClientId.mockResolvedValue(null);

    await expect(
      service.execute('client-1', 'conv-inexistente'),
    ).rejects.toThrow(NotFoundException);
  });
});
