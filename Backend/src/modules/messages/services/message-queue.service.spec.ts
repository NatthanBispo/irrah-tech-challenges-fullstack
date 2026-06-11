import { MessagePriority, MessageStatus } from '@prisma/client';
import { MessagesRepository } from '../repositories/messages.repository';
import { MessageQueueService } from './message-queue.service';

describe('MessageQueueService', () => {
  let service: MessageQueueService;

  const messagesRepository = {
    resetProcessingMessages: jest.fn().mockResolvedValue({ count: 0 }),
    findQueuedMessages: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    service = new MessageQueueService(
      messagesRepository as unknown as MessagesRepository,
    );
    jest.clearAllMocks();
  });

  it('reseta mensagens processing para queued na hidratação', async () => {
    await service.hydrate();

    expect(messagesRepository.resetProcessingMessages).toHaveBeenCalled();
  });

  it('processa mensagens urgentes antes das normais', () => {
    service.enqueue('urgent-1', MessagePriority.urgent);
    service.enqueue('normal-1', MessagePriority.normal);
    service.enqueue('urgent-2', MessagePriority.urgent);

    expect(service.dequeue()).toBe('urgent-1');
    expect(service.dequeue()).toBe('urgent-2');
    expect(service.dequeue()).toBe('normal-1');
    expect(service.dequeue()).toBeUndefined();
  });

  it('processa mensagens normais em ordem FIFO', () => {
    service.enqueue('normal-1', MessagePriority.normal);
    service.enqueue('normal-2', MessagePriority.normal);
    service.enqueue('normal-3', MessagePriority.normal);

    expect(service.dequeue()).toBe('normal-1');
    expect(service.dequeue()).toBe('normal-2');
    expect(service.dequeue()).toBe('normal-3');
    expect(service.dequeue()).toBeUndefined();
  });

  it('não duplica ids na mesma fila', () => {
    service.enqueue('msg-1', MessagePriority.normal);
    service.enqueue('msg-1', MessagePriority.normal);

    expect(service.getQueueSizes()).toEqual({ urgent: 0, normal: 1 });
  });
});
