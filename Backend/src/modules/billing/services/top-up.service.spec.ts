import { BadRequestException } from '@nestjs/common';
import { PlanType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { BillingRepository } from '../repositories/billing.repository';
import { TopUpService } from './top-up.service';

describe('TopUpService', () => {
  let service: TopUpService;

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  const billingRepository = {
    incrementBalance: jest.fn(),
  };

  const recordTransaction = {
    execute: jest.fn().mockResolvedValue(undefined),
    buildDescription: jest.fn((type: string) => type),
  };

  const prepaidClient = {
    id: 'client-1',
    planType: PlanType.prepaid,
    balance: 500,
  };

  beforeEach(() => {
    service = new TopUpService(
      billingRepository as unknown as BillingRepository,
      recordTransaction as unknown as RecordTransactionService,
      i18n as unknown as I18nService,
    );
    jest.clearAllMocks();
    recordTransaction.execute.mockResolvedValue(undefined);
    recordTransaction.buildDescription.mockImplementation((type: string) => type);
  });

  it('incrementa saldo de cliente pré-pago em centavos', async () => {
    billingRepository.incrementBalance.mockResolvedValue({
      ...prepaidClient,
      balance: 1500,
    });

    const result = await service.execute(prepaidClient as never, { amount: 1000 });

    expect(billingRepository.incrementBalance).toHaveBeenCalledWith(
      'client-1',
      1000,
    );
    expect(result.balance).toBe(1500);
  });

  it('registra transação de crédito após recarga', async () => {
    billingRepository.incrementBalance.mockResolvedValue({
      ...prepaidClient,
      balance: 1500,
    });

    await service.execute(prepaidClient as never, { amount: 1000 });

    expect(recordTransaction.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        type: TransactionType.credit,
        amount: 1000,
        balanceAfter: 1500,
      }),
    );
  });

  it('rejeita recarga para cliente pós-pago', async () => {
    await expect(
      service.execute(
        { ...prepaidClient, planType: PlanType.postpaid } as never,
        { amount: 1000 },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(i18n.t).toHaveBeenCalledWith('billing.PREPAID_ONLY');
    expect(billingRepository.incrementBalance).not.toHaveBeenCalled();
  });
});
