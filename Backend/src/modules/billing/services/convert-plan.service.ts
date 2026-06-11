import { BadRequestException, Injectable } from '@nestjs/common';
import { Client, PlanType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { BillingRepository } from '../repositories/billing.repository';
import { ConvertPlanDto } from '../dto/convert-plan.dto';

@Injectable()
export class ConvertPlanService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly recordTransaction: RecordTransactionService,
    private readonly i18n: I18nService,
  ) {}

  async execute(client: Client, dto: ConvertPlanDto) {
    if (client.planType === dto.planType) {
      throw new BadRequestException(
        this.i18n.t('billing.SAME_PLAN'),
      );
    }

    const current = await this.billingRepository.findClientById(client.id);

    return this.billingRepository.runTransaction(async (tx) => {
      if (dto.planType === PlanType.postpaid) {
        const updated = await this.billingRepository.convertToPostpaid(
          tx,
          client.id,
        );

        if (current.balance > 0) {
          await this.recordTransaction.executeWithTx(tx, {
            clientId: client.id,
            type: TransactionType.plan_conversion_credit,
            amount: current.balance,
            description: this.recordTransaction.buildDescription(
              TransactionType.plan_conversion_credit,
            ),
            balanceAfter: 0,
          });
        }

        return {
          planType: updated.planType,
          limit: updated.limit,
          monthlyUsage: updated.monthlyUsage,
          available: updated.limit - updated.monthlyUsage,
        };
      }

      const updated = await this.billingRepository.convertToPrepaid(
        tx,
        client.id,
      );

      if (current.monthlyUsage > 0) {
        await this.recordTransaction.executeWithTx(tx, {
          clientId: client.id,
          type: TransactionType.postpaid_settlement,
          amount: current.monthlyUsage,
          description: this.recordTransaction.buildDescription(
            TransactionType.postpaid_settlement,
          ),
        });
      }

      return {
        planType: updated.planType,
        balance: updated.balance,
      };
    });
  }
}
