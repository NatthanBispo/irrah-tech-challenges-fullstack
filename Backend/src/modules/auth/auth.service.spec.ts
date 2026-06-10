import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../shared/database/prisma.service';
import { DocumentType } from '../../shared/utils/enums';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    client: {
      findFirst: jest.fn(),
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
    planType: 'prepaid',
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
      planType: 'prepaid',
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
});
