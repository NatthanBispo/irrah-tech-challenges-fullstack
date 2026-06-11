import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePriority, MessageStatus, PlanType, SenderType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { MessagesRepository } from '../repositories/messages.repository';
import { MessageQueueService } from './message-queue.service';
import { SendMessageService } from './send-message.service';

describe('SendMessageService', () => {
  let service: SendMessageService;

  const messageQueue = {
    enqueue: jest.fn(),
  };

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  const prepaidClient = {
    id: 'client-1',
    name: 'Empresa',
    documentId: '39053344705',
    documentType: 'CPF' as const,
    planType: PlanType.prepaid,
    balance: 1000,
    limit: 0,
    monthlyUsage: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const conversation = {
    id: 'conv-1',
    clientId: 'client-1',
    recipientId: 'recipient-1',
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdMessage = {
    id: 'msg-1',
    conversationId: 'conv-1',
    content: 'Olá',
    priority: MessagePriority.normal,
    status: MessageStatus.queued,
    cost: 25,
    sentById: 'client-1',
    sentByType: SenderType.client,
    timestamp: new Date('2026-06-11T12:00:00.000Z'),
    estimatedDelivery: new Date('2026-06-11T12:00:30.000Z'),
  };

  const messagesRepository = {
    runTransaction: jest.fn(),
    findClientOrThrow: jest.fn(),
    findConversationByIdAndClientId: jest.fn(),
    findRecipientById: jest.fn(),
    upsertConversation: jest.fn(),
    debitPrepaidBalance: jest.fn(),
    incrementPostpaidUsage: jest.fn(),
    createMessage: jest.fn(),
    touchConversation: jest.fn(),
  };

  const recordTransaction = {
    executeWithTx: jest.fn().mockResolvedValue(undefined),
    buildDescription: jest.fn((type: string) => type),
  };

  beforeEach(() => {
    service = new SendMessageService(
      messagesRepository as unknown as MessagesRepository,
      messageQueue as unknown as MessageQueueService,
      recordTransaction as unknown as RecordTransactionService,
      i18n as unknown as I18nService,
    );
    jest.clearAllMocks();
    recordTransaction.executeWithTx.mockResolvedValue(undefined);
    recordTransaction.buildDescription.mockImplementation((type: string) => type);
  });

  it('registra transação de débito ao enviar mensagem pré-pago', async () => {
    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue(prepaidClient);
    messagesRepository.findConversationByIdAndClientId.mockResolvedValue(conversation);
    messagesRepository.debitPrepaidBalance.mockResolvedValue({ ...prepaidClient, balance: 975 });
    messagesRepository.createMessage.mockResolvedValue(createdMessage);
    messagesRepository.touchConversation.mockResolvedValue(conversation);

    await service.execute(prepaidClient, {
      conversationId: 'conv-1',
      content: 'Olá',
      priority: MessagePriority.normal,
    });

    expect(recordTransaction.executeWithTx).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        clientId: 'client-1',
        type: TransactionType.debit,
        amount: 25,
        messageId: 'msg-1',
      }),
    );
  });

  it('envia mensagem normal debitando saldo pré-pago', async () => {
    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({
        client: {
          findUniqueOrThrow: jest.fn().mockResolvedValue(prepaidClient),
          update: jest.fn().mockResolvedValue({ ...prepaidClient, balance: 975 }),
        },
        conversation: {
          findFirst: jest.fn().mockResolvedValue(conversation),
          update: jest.fn(),
        },
        message: {
          create: jest.fn().mockResolvedValue(createdMessage),
        },
      }),
    );

    messagesRepository.findClientOrThrow.mockResolvedValue(prepaidClient);
    messagesRepository.findConversationByIdAndClientId.mockResolvedValue(
      conversation,
    );
    messagesRepository.debitPrepaidBalance.mockResolvedValue({
      ...prepaidClient,
      balance: 975,
    });
    messagesRepository.createMessage.mockResolvedValue(createdMessage);
    messagesRepository.touchConversation.mockResolvedValue(conversation);

    const result = await service.execute(prepaidClient, {
      conversationId: 'conv-1',
      content: 'Olá',
      priority: MessagePriority.normal,
    });

    expect(result.status).toBe('queued');
    expect(result.cost).toBe(25);
    expect(result.currentBalance).toBe(975);
    expect(messageQueue.enqueue).toHaveBeenCalledWith('msg-1', MessagePriority.normal);
  });

  it('cobra 50 centavos para mensagens urgentes', async () => {
    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue(prepaidClient);
    messagesRepository.findConversationByIdAndClientId.mockResolvedValue(
      conversation,
    );
    messagesRepository.debitPrepaidBalance.mockResolvedValue({
      ...prepaidClient,
      balance: 950,
    });
    messagesRepository.createMessage.mockResolvedValue({
      ...createdMessage,
      priority: MessagePriority.urgent,
      cost: 50,
    });
    messagesRepository.touchConversation.mockResolvedValue(conversation);

    const result = await service.execute(prepaidClient, {
      conversationId: 'conv-1',
      content: 'Urgente',
      priority: MessagePriority.urgent,
    });

    expect(result.cost).toBe(50);
    expect(messageQueue.enqueue).toHaveBeenCalledWith('msg-1', MessagePriority.urgent);
  });

  it('envia mensagem pós-pago incrementando monthlyUsage', async () => {
    const postpaidClient = {
      ...prepaidClient,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      monthlyUsage: 4000,
    };

    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue(postpaidClient);
    messagesRepository.findConversationByIdAndClientId.mockResolvedValue(
      conversation,
    );
    messagesRepository.incrementPostpaidUsage.mockResolvedValue({
      ...postpaidClient,
      monthlyUsage: 4025,
    });
    messagesRepository.createMessage.mockResolvedValue(createdMessage);
    messagesRepository.touchConversation.mockResolvedValue(conversation);

    const result = await service.execute(postpaidClient, {
      conversationId: 'conv-1',
      content: 'Olá',
      priority: MessagePriority.normal,
    });

    expect(messagesRepository.incrementPostpaidUsage).toHaveBeenCalled();
    expect(result.status).toBe('queued');
    expect(result.cost).toBe(25);
    expect(result.currentBalance).toBeUndefined();
    expect(messageQueue.enqueue).toHaveBeenCalledWith('msg-1', MessagePriority.normal);
  });

  it('permite envio pós-pago dentro do limite mensal restante', async () => {
    const postpaidClient = {
      ...prepaidClient,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 5000,
      monthlyUsage: 4000,
    };

    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue(postpaidClient);
    messagesRepository.findConversationByIdAndClientId.mockResolvedValue(
      conversation,
    );
    messagesRepository.incrementPostpaidUsage.mockResolvedValue({
      ...postpaidClient,
      monthlyUsage: 4025,
    });
    messagesRepository.createMessage.mockResolvedValue(createdMessage);
    messagesRepository.touchConversation.mockResolvedValue(conversation);

    await expect(
      service.execute(postpaidClient, {
        conversationId: 'conv-1',
        content: 'Dentro do limite',
        priority: MessagePriority.normal,
      }),
    ).resolves.toMatchObject({ status: 'queued', cost: 25 });
  });

  it('rejeita envio pós-pago quando monthlyUsage + cost excede limite', async () => {
    const postpaidClient = {
      ...prepaidClient,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      monthlyUsage: 9990,
    };

    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue(postpaidClient);

    await expect(
      service.execute(postpaidClient, {
        conversationId: 'conv-1',
        content: 'Acima do limite',
        priority: MessagePriority.normal,
      }),
    ).rejects.toMatchObject({ status: HttpStatus.PAYMENT_REQUIRED });
  });

  it('rejeita envio quando saldo é insuficiente', async () => {
    messagesRepository.runTransaction.mockImplementation(async (callback) =>
      callback({}),
    );
    messagesRepository.findClientOrThrow.mockResolvedValue({
      ...prepaidClient,
      balance: 10,
    });

    await expect(
      service.execute(prepaidClient, {
        conversationId: 'conv-1',
        content: 'Olá',
        priority: MessagePriority.normal,
      }),
    ).rejects.toThrow(HttpException);
  });

  it('exige conversa ou destinatário', async () => {
    await expect(
      service.execute(prepaidClient, {
        content: 'Olá',
        priority: MessagePriority.normal,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
