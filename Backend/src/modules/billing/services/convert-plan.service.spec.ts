import { BadRequestException } from '@nestjs/common';
import { PlanType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { BillingRepository } from '../repositories/billing.repository';
import { ConvertPlanService } from './convert-plan.service';

describe('ConvertPlanService', () => {
  let service: ConvertPlanService;

  const i18n = { t: jest.fn((key: string) => key) };

  const billingRepository = {
    findClientById: jest.fn(),
    convertToPostpaid: jest.fn(),
    convertToPrepaid: jest.fn(),
    runTransaction: jest.fn((fn: CallableFunction) => fn({})),
  };

  const recordTransaction = {
    executeWithTx: jest.fn().mockResolvedValue(undefined),
    buildDescription: jest.fn((type: string) => type),
  };

  const prepaidClient = {
    id: 'client-1',
    planType: PlanType.prepaid,
    balance: 500,
    monthlyUsage: 0,
    limit: 0,
  };

  const postpaidClient = {
    id: 'client-2',
    planType: PlanType.postpaid,
    balance: 0,
    monthlyUsage: 3000,
    limit: 10000,
  };

  beforeEach(() => {
    service = new ConvertPlanService(
      billingRepository as unknown as BillingRepository,
      recordTransaction as unknown as RecordTransactionService,
      i18n as unknown as I18nService,
    );
    jest.clearAllMocks();
    recordTransaction.executeWithTx.mockResolvedValue(undefined);
    recordTransaction.buildDescription.mockImplementation((type: string) => type);
    billingRepository.runTransaction.mockImplementation((fn: CallableFunction) => fn({}));
  });

  it('converte cliente pré-pago para pós-pago', async () => {
    billingRepository.findClientById.mockResolvedValue(prepaidClient);
    billingRepository.convertToPostpaid.mockResolvedValue({
      ...prepaidClient,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      monthlyUsage: 0,
    });

    const result = await service.execute(prepaidClient as never, {
      planType: PlanType.postpaid,
    });

    expect(result.planType).toBe(PlanType.postpaid);
    expect(result.limit).toBe(10000);
    expect(result.available).toBe(10000);
  });

  it('registra transação de crédito ao converter pré→pós com saldo', async () => {
    billingRepository.findClientById.mockResolvedValue(prepaidClient);
    billingRepository.convertToPostpaid.mockResolvedValue({
      ...prepaidClient,
      planType: PlanType.postpaid,
      balance: 0,
      limit: 10000,
      monthlyUsage: 0,
    });

    await service.execute(prepaidClient as never, { planType: PlanType.postpaid });

    expect(recordTransaction.executeWithTx).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: TransactionType.plan_conversion_credit,
        amount: 500,
      }),
    );
  });

  it('converte cliente pós-pago para pré-pago', async () => {
    billingRepository.findClientById.mockResolvedValue(postpaidClient);
    billingRepository.convertToPrepaid.mockResolvedValue({
      ...postpaidClient,
      planType: PlanType.prepaid,
      balance: 0,
      limit: 0,
      monthlyUsage: 0,
    });

    const result = await service.execute(postpaidClient as never, {
      planType: PlanType.prepaid,
    });

    expect(result.planType).toBe(PlanType.prepaid);
  });

  it('registra transação de apuração ao converter pós→pré com consumo', async () => {
    billingRepository.findClientById.mockResolvedValue(postpaidClient);
    billingRepository.convertToPrepaid.mockResolvedValue({
      ...postpaidClient,
      planType: PlanType.prepaid,
      balance: 0,
    });

    await service.execute(postpaidClient as never, { planType: PlanType.prepaid });

    expect(recordTransaction.executeWithTx).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: TransactionType.postpaid_settlement,
        amount: 3000,
      }),
    );
  });

  it('rejeita conversão para o mesmo plano', async () => {
    await expect(
      service.execute(prepaidClient as never, { planType: PlanType.prepaid }),
    ).rejects.toThrow(BadRequestException);
  });

  it('não registra transação ao converter pré→pós com saldo zero', async () => {
    const prepaidZero = { ...prepaidClient, balance: 0 };
    billingRepository.findClientById.mockResolvedValue(prepaidZero);
    billingRepository.convertToPostpaid.mockResolvedValue({
      ...prepaidZero,
      planType: PlanType.postpaid,
      limit: 10000,
      monthlyUsage: 0,
    });

    await service.execute(prepaidZero as never, { planType: PlanType.postpaid });

    expect(recordTransaction.executeWithTx).not.toHaveBeenCalled();
  });

  it('não registra transação ao converter pós→pré com consumo zero', async () => {
    const postpaidZeroUsage = { ...postpaidClient, monthlyUsage: 0 };
    billingRepository.findClientById.mockResolvedValue(postpaidZeroUsage);
    billingRepository.convertToPrepaid.mockResolvedValue({
      ...postpaidZeroUsage,
      planType: PlanType.prepaid,
      balance: 0,
      limit: 0,
      monthlyUsage: 0,
    });

    await service.execute(postpaidZeroUsage as never, { planType: PlanType.prepaid });

    expect(recordTransaction.executeWithTx).not.toHaveBeenCalled();
  });
});
