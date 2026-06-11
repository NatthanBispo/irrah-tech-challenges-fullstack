import { BadRequestException } from '@nestjs/common';
import { PlanType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { BillingRepository } from '../repositories/billing.repository';
import { UpdateLimitService } from './update-limit.service';

describe('UpdateLimitService', () => {
  let service: UpdateLimitService;

  const i18n = { t: jest.fn((key: string) => key) };

  const billingRepository = {
    findClientById: jest.fn(),
    updateLimit: jest.fn(),
  };

  const postpaidClient = {
    id: 'client-1',
    planType: PlanType.postpaid,
    limit: 10000,
    monthlyUsage: 3000,
  };

  beforeEach(() => {
    service = new UpdateLimitService(
      billingRepository as unknown as BillingRepository,
      i18n as unknown as I18nService,
    );
    jest.clearAllMocks();
  });

  it('atualiza limite de cliente pós-pago', async () => {
    billingRepository.findClientById.mockResolvedValue(postpaidClient);
    billingRepository.updateLimit.mockResolvedValue({
      ...postpaidClient,
      limit: 15000,
    });

    const result = await service.execute(
      postpaidClient as never,
      { limit: 15000 },
    );

    expect(billingRepository.updateLimit).toHaveBeenCalledWith('client-1', 15000);
    expect(result).toEqual({ limit: 15000 });
  });

  it('rejeita atualização de limite para cliente pré-pago', async () => {
    await expect(
      service.execute(
        { ...postpaidClient, planType: PlanType.prepaid } as never,
        { limit: 15000 },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejeita limite menor que consumo atual', async () => {
    billingRepository.findClientById.mockResolvedValue(postpaidClient);

    await expect(
      service.execute(postpaidClient as never, { limit: 1000 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('aceita limite exatamente igual ao consumo atual', async () => {
    billingRepository.findClientById.mockResolvedValue(postpaidClient);
    billingRepository.updateLimit.mockResolvedValue({
      ...postpaidClient,
      limit: 3000,
    });

    const result = await service.execute(postpaidClient as never, { limit: 3000 });

    expect(billingRepository.updateLimit).toHaveBeenCalledWith('client-1', 3000);
    expect(result).toEqual({ limit: 3000 });
  });
});
