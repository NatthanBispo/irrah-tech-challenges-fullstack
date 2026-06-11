import { PlanType } from '@prisma/client';
import { BillingRepository } from '../repositories/billing.repository';
import { GetBalanceService } from './get-balance.service';

describe('GetBalanceService', () => {
  let service: GetBalanceService;

  const billingRepository = {
    findClientById: jest.fn(),
  };

  beforeEach(() => {
    service = new GetBalanceService(
      billingRepository as unknown as BillingRepository,
    );
    jest.clearAllMocks();
  });

  it('retorna saldo para cliente pré-pago', async () => {
    billingRepository.findClientById.mockResolvedValue({
      id: 'client-1',
      planType: PlanType.prepaid,
      balance: 500,
    });

    const result = await service.execute({ id: 'client-1' } as never);

    expect(result).toEqual({ planType: PlanType.prepaid, balance: 500 });
  });

  it('retorna limite/consumo/disponível para cliente pós-pago', async () => {
    billingRepository.findClientById.mockResolvedValue({
      id: 'client-1',
      planType: PlanType.postpaid,
      limit: 10000,
      monthlyUsage: 3000,
    });

    const result = await service.execute({ id: 'client-1' } as never);

    expect(result).toEqual({
      planType: PlanType.postpaid,
      limit: 10000,
      monthlyUsage: 3000,
      available: 7000,
    });
  });
});
