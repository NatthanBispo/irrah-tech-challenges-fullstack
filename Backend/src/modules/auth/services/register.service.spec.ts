import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { DocumentType, PlanType } from '../../../shared/utils/enums';
import { ClientsRepository } from '../repositories/clients.repository';
import { RegisterService } from './register.service';

describe('RegisterService', () => {
  let service: RegisterService;

  const clientsRepository = {
    findByDocumentId: jest.fn(),
    create: jest.fn(),
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
    balance: 5000,
    limit: 0,
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        { provide: ClientsRepository, useValue: clientsRepository },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get(RegisterService);
    jest.clearAllMocks();
  });

  it('cadastra cliente pré-pago com saldo zero', async () => {
    clientsRepository.findByDocumentId.mockResolvedValue(null);
    clientsRepository.create.mockResolvedValue({
      ...prepaidClient,
      balance: 0,
    });

    const result = await service.execute({
      name: 'Empresa ABC',
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
    });

    expect(clientsRepository.create).toHaveBeenCalledWith({
      name: 'Empresa ABC',
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
      balance: 0,
      limit: 0,
      monthlyUsage: 0,
      active: true,
    });
    expect(result.token).toBe('client-1');
    expect(result.client.balance).toBe(0);
    expect(result.client.limit).toBeUndefined();
  });

  it('cadastra cliente pós-pago com limite padrão', async () => {
    clientsRepository.findByDocumentId.mockResolvedValue(null);
    clientsRepository.create.mockResolvedValue({
      id: 'client-2',
      name: 'Tech Solutions',
      documentId: '11222333000181',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      active: true,
    });

    const result = await service.execute({
      name: 'Tech Solutions',
      documentId: '11222333000181',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
    });

    expect(clientsRepository.create).toHaveBeenCalledWith({
      name: 'Tech Solutions',
      documentId: '11222333000181',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      monthlyUsage: 0,
      active: true,
    });
    expect(result.client.limit).toBe(10000);
    expect(result.client.balance).toBeUndefined();
  });

  it('lança ConflictException quando documento já existe', async () => {
    clientsRepository.findByDocumentId.mockResolvedValue(prepaidClient);

    await expect(
      service.execute({
        name: 'Outro Cliente',
        documentId: '39053344705',
        documentType: DocumentType.CPF,
        planType: PlanType.prepaid,
      }),
    ).rejects.toThrow(ConflictException);

    expect(i18n.t).toHaveBeenCalledWith('auth.DOCUMENT_ALREADY_EXISTS');
    expect(clientsRepository.create).not.toHaveBeenCalled();
  });
});
