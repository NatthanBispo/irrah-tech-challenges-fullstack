import { Injectable } from '@nestjs/common';
import { Client, PlanType } from '@prisma/client';
import { BillingRepository } from '../repositories/billing.repository';

@Injectable()
export class GetBalanceService {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(client: Client) {
    const current = await this.billingRepository.findClientById(client.id);

    if (current.planType === PlanType.prepaid) {
      return {
        planType: current.planType,
        balance: current.balance,
      };
    }

    return {
      planType: current.planType,
      limit: current.limit,
      monthlyUsage: current.monthlyUsage,
      available: current.limit - current.monthlyUsage,
    };
  }
}
