import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { DocumentType, PlanType } from '../../../shared/utils/enums';
import { ClientsRepository } from '../repositories/clients.repository';
import { AuthenticateService } from './authenticate.service';

describe('AuthenticateService', () => {
  let service: AuthenticateService;

  const clientsRepository = {
    findByDocument: jest.fn(),
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
        AuthenticateService,
        { provide: ClientsRepository, useValue: clientsRepository },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get(AuthenticateService);
    jest.clearAllMocks();
  });

  it('autentica cliente ativo por documento e retorna token e dados', async () => {
    clientsRepository.findByDocument.mockResolvedValue(prepaidClient);

    const result = await service.execute({
      documentId: '39053344705',
      documentType: DocumentType.CPF,
    });

    expect(result.token).toBe('client-1');
    expect(result.client).toEqual({
      id: 'client-1',
      name: 'Empresa ABC',
      documentId: '39053344705',
      documentType: DocumentType.CPF,
      balance: 5000,
      limit: undefined,
      planType: PlanType.prepaid,
      active: true,
    });
  });

  it('lança UnauthorizedException quando cliente não existe', async () => {
    clientsRepository.findByDocument.mockResolvedValue(null);

    await expect(
      service.execute({
        documentId: '52998224725',
        documentType: DocumentType.CPF,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(i18n.t).toHaveBeenCalledWith('auth.INVALID_CREDENTIALS');
  });

  it('lança UnauthorizedException quando cliente está inativo', async () => {
    clientsRepository.findByDocument.mockResolvedValue({
      ...prepaidClient,
      active: false,
    });

    await expect(
      service.execute({
        documentId: '39053344705',
        documentType: DocumentType.CPF,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(i18n.t).toHaveBeenCalledWith('auth.INVALID_CREDENTIALS');
  });
});
