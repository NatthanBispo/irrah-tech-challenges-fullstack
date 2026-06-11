import { Logger } from '@nestjs/common';
import {
  MessagePriority,
  MessageStatus,
  MessageType,
  SenderType,
} from '@prisma/client';
import { MessagesRepository } from '../repositories/messages.repository';
import { MessageQueueService } from './message-queue.service';
import { QueueWorkerService } from './queue-worker.service';

describe('QueueWorkerService', () => {
  let service: QueueWorkerService;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;

  const messageQueue = {
    dequeue: jest.fn(),
  };

  const messagesRepository = {
    findMessageById: jest.fn(),
    updateMessageStatus: jest.fn().mockResolvedValue({}),
    createAutoReply: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    loggerDebugSpy = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => undefined);
    jest.useFakeTimers();
    jest.clearAllMocks();
    service = new QueueWorkerService(
      messagesRepository as unknown as MessagesRepository,
      messageQueue as unknown as MessageQueueService,
    );
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
    loggerDebugSpy.mockRestore();
    jest.useRealTimers();
  });

  it('retoma mensagem em processing sem repetir delay inicial', async () => {
    messageQueue.dequeue.mockReturnValue('msg-processing');
    messagesRepository.findMessageById.mockResolvedValue({
      id: 'msg-processing',
      status: MessageStatus.processing,
      priority: MessagePriority.normal,
      sentByType: SenderType.client,
      type: MessageType.whatsapp,
      conversation: {
        id: 'conv-1',
        recipientId: 'rec-1',
        recipient: { name: 'Maria Silva' },
      },
    });

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.updateMessageStatus).not.toHaveBeenCalledWith(
      'msg-processing',
      MessageStatus.processing,
    );
    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-processing',
      MessageStatus.sent,
    );
    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-processing',
      MessageStatus.delivered,
    );
  });

  it('processa mensagem queued com transição até delivered', async () => {
    messageQueue.dequeue.mockReturnValue('msg-queued');
    messagesRepository.findMessageById.mockResolvedValue({
      id: 'msg-queued',
      status: MessageStatus.queued,
      priority: MessagePriority.normal,
      sentByType: SenderType.user,
      type: MessageType.sms,
      conversation: {
        id: 'conv-3',
        recipientId: 'rec-3',
        recipient: { name: 'Ana Costa' },
      },
    });

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-queued',
      MessageStatus.processing,
    );
    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-queued',
      MessageStatus.sent,
    );
    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-queued',
      MessageStatus.delivered,
    );
    expect(messagesRepository.createAutoReply).not.toHaveBeenCalled();
  });

  it('marca mensagem como failed quando ocorre erro no processamento', async () => {
    messageQueue.dequeue.mockReturnValue('msg-error');
    messagesRepository.findMessageById.mockResolvedValue({
      id: 'msg-error',
      status: MessageStatus.queued,
      priority: MessagePriority.normal,
      sentByType: SenderType.client,
      type: MessageType.whatsapp,
      conversation: {
        id: 'conv-4',
        recipientId: 'rec-4',
        recipient: { name: 'Erro Test' },
      },
    });
    messagesRepository.updateMessageStatus.mockRejectedValueOnce(
      new Error('DB error'),
    );

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.updateMessageStatus).toHaveBeenCalledWith(
      'msg-error',
      MessageStatus.failed,
    );
    expect(messagesRepository.createAutoReply).not.toHaveBeenCalled();
  });

  it('cria resposta automática via whatsapp quando mensagem do client é whatsapp', async () => {
    messageQueue.dequeue.mockReturnValue('msg-client-wa');
    messagesRepository.findMessageById.mockResolvedValue({
      id: 'msg-client-wa',
      status: MessageStatus.queued,
      priority: MessagePriority.urgent,
      sentByType: SenderType.client,
      type: MessageType.whatsapp,
      conversation: {
        id: 'conv-2',
        recipientId: 'rec-2',
        recipient: { name: 'João Santos' },
      },
    });

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.createAutoReply).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.whatsapp }),
    );
  });

  it('cria resposta automática via sms quando mensagem do client é sms', async () => {
    messageQueue.dequeue.mockReturnValue('msg-client-sms');
    messagesRepository.findMessageById.mockResolvedValue({
      id: 'msg-client-sms',
      status: MessageStatus.queued,
      priority: MessagePriority.normal,
      sentByType: SenderType.client,
      type: MessageType.sms,
      conversation: {
        id: 'conv-5',
        recipientId: 'rec-5',
        recipient: { name: 'Maria SMS' },
      },
    });

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.createAutoReply).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.sms }),
    );
  });
});
