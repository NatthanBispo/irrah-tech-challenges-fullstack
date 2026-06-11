import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../shared/database/prisma.service';
import { DocumentType, PlanType } from '../../shared/utils/enums';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

const PASSWORD = 'Senha1234';

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
    documentId: '39053344705',
    documentType: DocumentType.CPF,
    planType: PlanType.prepaid,
    balance: 50,
    limit: 0,
    active: true,
    passwordHash: 'hashed-password',
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
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  it('autentica cliente ativo com senha correta e retorna token e dados', async () => {
    prisma.client.findFirst.mockResolvedValue(prepaidClient);

    const result = await service.authenticate({
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      password: PASSWORD,
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(PASSWORD, 'hashed-password');
    expect(result.token).toBe('client-1');
    expect(result.client).toEqual({
      id: 'client-1',
      name: 'Empresa ABC',
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      balance: 50,
      limit: undefined,
      planType: PlanType.prepaid,
      active: true,
    });
  });

  it('lança UnauthorizedException quando cliente não existe', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(
      service.authenticate({
        documentId: '52998224725',
        documentType: DocumentType.CPF,
        password: PASSWORD,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(i18n.t).toHaveBeenCalledWith('auth.INVALID_CREDENTIALS');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando cliente está inativo', async () => {
    prisma.client.findFirst.mockResolvedValue({
      ...prepaidClient,
      active: false,
    });

    await expect(
      service.authenticate({
        documentId: '39053344705',
        documentType: DocumentType.CPF,
        password: PASSWORD,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(i18n.t).toHaveBeenCalledWith('auth.INVALID_CREDENTIALS');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando senha está incorreta', async () => {
    prisma.client.findFirst.mockResolvedValue(prepaidClient);
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.authenticate({
        documentId: '39053344705',
        documentType: DocumentType.CPF,
        password: 'SenhaErrada',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(i18n.t).toHaveBeenCalledWith('auth.INVALID_CREDENTIALS');
  });

  it('cadastra cliente pré-pago com senha hasheada e saldo zero', async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    prisma.client.create.mockResolvedValue({
      ...prepaidClient,
      balance: 0,
    });

    const result = await service.register({
      name: 'Empresa ABC',
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
      password: PASSWORD,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(PASSWORD, 10);
    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        name: 'Empresa ABC',
        documentId: '39053344705',
        documentType: DocumentType.CPF,
        planType: PlanType.prepaid,
        passwordHash: 'hashed-password',
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
      documentId: '11222333000181',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 100,
      active: true,
      passwordHash: 'hashed-password',
    });

    const result = await service.register({
      name: 'Tech Solutions',
      documentId: '11222333000181',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      password: PASSWORD,
    });

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planType: PlanType.postpaid,
        limit: 100,
        balance: 0,
        passwordHash: 'hashed-password',
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
        documentId: '39053344705',
        documentType: DocumentType.CPF,
        planType: PlanType.prepaid,
        password: PASSWORD,
      }),
    ).rejects.toThrow(ConflictException);

    expect(i18n.t).toHaveBeenCalledWith('auth.DOCUMENT_ALREADY_EXISTS');
    expect(prisma.client.create).not.toHaveBeenCalled();
  });
});
