import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
  });
});
