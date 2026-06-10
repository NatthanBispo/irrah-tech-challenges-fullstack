import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../shared/database/prisma.service';
import { DocumentType, PlanType } from '../../shared/utils/enums';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    client: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  const prepaidClient = {
    id: 'client-1',
    name: 'Empresa ABC',
    documentId: '12345678901',
    documentType: DocumentType.CPF,
    planType: PlanType.prepaid,
    balance: 50,
    limit: 0,
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('autentica cliente ativo e retorna token e dados', async () => {
    prisma.client.findFirst.mockResolvedValue(prepaidClient);

    const result = await service.authenticate({
      documentId: '12345678901',
      documentType: DocumentType.CPF,
    });

    expect(result.token).toBe('client-1');
    expect(result.client).toEqual({
      id: 'client-1',
      name: 'Empresa ABC',
      documentId: '12345678901',
      documentType: DocumentType.CPF,
      balance: 50,
      limit: undefined,
      planType: PlanType.prepaid,
      active: true,
    });
  });

  it('lança NotFoundException quando cliente não existe', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(
      service.authenticate({
        documentId: '00000000000',
        documentType: DocumentType.CPF,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(i18n.t).toHaveBeenCalledWith('auth.CLIENT_NOT_FOUND');
  });

  it('lança NotFoundException quando cliente está inativo', async () => {
    prisma.client.findFirst.mockResolvedValue({
      ...prepaidClient,
      active: false,
    });

    await expect(
      service.authenticate({
        documentId: '12345678901',
        documentType: DocumentType.CPF,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(i18n.t).toHaveBeenCalledWith('auth.CLIENT_INACTIVE');
  });

  it('cadastra cliente pré-pago com saldo zero', async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    prisma.client.create.mockResolvedValue({
      ...prepaidClient,
      balance: 0,
    });

    const result = await service.register({
      name: 'Empresa ABC',
      documentId: '12345678901',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
    });

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        name: 'Empresa ABC',
        documentId: '12345678901',
        documentType: DocumentType.CPF,
        planType: PlanType.prepaid,
        balance: 0,
        limit: 0,
        monthlyUsage: 0,
        active: true,
      },
    });
    expect(result.token).toBe('client-1');
    expect(result.client.balance).toBe(0);
    expect(result.client.limit).toBeUndefined();
  });

  it('cadastra cliente pós-pago com limite padrão', async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    prisma.client.create.mockResolvedValue({
      id: 'client-2',
      name: 'Tech Solutions',
      documentId: '12345678000199',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 100,
      active: true,
    });

    const result = await service.register({
      name: 'Tech Solutions',
      documentId: '12345678000199',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
    });

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planType: PlanType.postpaid,
        limit: 100,
        balance: 0,
      }),
    });
    expect(result.client.limit).toBe(100);
    expect(result.client.balance).toBeUndefined();
  });

  it('lança ConflictException quando documento já existe', async () => {
    prisma.client.findUnique.mockResolvedValue(prepaidClient);

    await expect(
      service.register({
        name: 'Outro Cliente',
        documentId: '12345678901',
        documentType: DocumentType.CPF,
        planType: PlanType.prepaid,
      }),
    ).rejects.toThrow(ConflictException);

    expect(i18n.t).toHaveBeenCalledWith('auth.DOCUMENT_ALREADY_EXISTS');
    expect(prisma.client.create).not.toHaveBeenCalled();
  });
});
