import { Logger } from '@nestjs/common';
import {
  MessagePriority,
  MessageStatus,
  MessageType,
  SenderType,
} from '@prisma/client';
import { MessagesGateway } from '../gateways/messages.gateway';
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

  const gateway = {
    emitStatusUpdate: jest.fn(),
    emitNewReply: jest.fn(),
  };

  function makeMessage(overrides: Record<string, unknown> = {}) {
    return {
      id: 'msg-1',
      status: MessageStatus.queued,
      priority: MessagePriority.normal,
      sentByType: SenderType.client,
      type: MessageType.whatsapp,
      conversation: {
        id: 'conv-1',
        clientId: 'client-1',
        recipientId: 'rec-1',
        recipient: { name: 'Maria Silva' },
      },
      ...overrides,
    };
  }

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
      gateway as unknown as MessagesGateway,
    );
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
    loggerDebugSpy.mockRestore();
    jest.useRealTimers();
  });

  it('retoma mensagem em processing sem repetir delay inicial', async () => {
    messageQueue.dequeue.mockReturnValue('msg-processing');
    messagesRepository.findMessageById.mockResolvedValue(
      makeMessage({ id: 'msg-processing', status: MessageStatus.processing }),
    );

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

  it('processa mensagem queued com transição completa até delivered', async () => {
    messageQueue.dequeue.mockReturnValue('msg-queued');
    messagesRepository.findMessageById.mockResolvedValue(
      makeMessage({
        id: 'msg-queued',
        sentByType: SenderType.user,
        type: MessageType.sms,
        conversation: {
          id: 'conv-3',
          clientId: 'client-3',
          recipientId: 'rec-3',
          recipient: { name: 'Ana Costa' },
        },
      }),
    );

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

  it('emite eventos de status para o gateway em cada transição', async () => {
    messageQueue.dequeue.mockReturnValue('msg-events');
    messagesRepository.findMessageById.mockResolvedValue(
      makeMessage({ id: 'msg-events', sentByType: SenderType.user }),
    );

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(gateway.emitStatusUpdate).toHaveBeenCalledWith('client-1', {
      messageId: 'msg-events',
      conversationId: 'conv-1',
      status: MessageStatus.processing,
    });
    expect(gateway.emitStatusUpdate).toHaveBeenCalledWith('client-1', {
      messageId: 'msg-events',
      conversationId: 'conv-1',
      status: MessageStatus.sent,
    });
    expect(gateway.emitStatusUpdate).toHaveBeenCalledWith('client-1', {
      messageId: 'msg-events',
      conversationId: 'conv-1',
      status: MessageStatus.delivered,
    });
  });

  it('marca mensagem como failed quando ocorre erro e emite status failed', async () => {
    messageQueue.dequeue.mockReturnValue('msg-error');
    messagesRepository.findMessageById
      .mockResolvedValueOnce(
        makeMessage({
          id: 'msg-error',
          conversation: { id: 'conv-4', clientId: 'client-4', recipientId: 'rec-4', recipient: { name: 'Erro' } },
        }),
      )
      .mockResolvedValueOnce(
        makeMessage({
          id: 'msg-error',
          conversation: { id: 'conv-4', clientId: 'client-4', recipientId: 'rec-4', recipient: { name: 'Erro' } },
        }),
      );
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
    messagesRepository.findMessageById.mockResolvedValue(
      makeMessage({
        id: 'msg-client-wa',
        priority: MessagePriority.urgent,
        type: MessageType.whatsapp,
        conversation: { id: 'conv-2', clientId: 'client-2', recipientId: 'rec-2', recipient: { name: 'João' } },
      }),
    );

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.createAutoReply).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.whatsapp }),
    );
    expect(gateway.emitNewReply).toHaveBeenCalledWith('client-2', {
      conversationId: 'conv-2',
    });
  });

  it('cria resposta automática via sms quando mensagem do client é sms', async () => {
    messageQueue.dequeue.mockReturnValue('msg-client-sms');
    messagesRepository.findMessageById.mockResolvedValue(
      makeMessage({
        id: 'msg-client-sms',
        type: MessageType.sms,
        conversation: { id: 'conv-5', clientId: 'client-5', recipientId: 'rec-5', recipient: { name: 'Maria SMS' } },
      }),
    );

    const promise = service.processQueue();
    await jest.runAllTimersAsync();
    await promise;

    expect(messagesRepository.createAutoReply).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.sms }),
    );
    expect(gateway.emitNewReply).toHaveBeenCalledWith('client-5', {
      conversationId: 'conv-5',
    });
  });
});
