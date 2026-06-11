import { BadRequestException, Injectable } from '@nestjs/common';
import { Client, PlanType, TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecordTransactionService } from '../../transactions/services/record-transaction.service';
import { TopUpDto } from '../dto/top-up.dto';
import { BillingRepository } from '../repositories/billing.repository';

@Injectable()
export class TopUpService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly recordTransaction: RecordTransactionService,
    private readonly i18n: I18nService,
  ) {}

  async execute(client: Client, dto: TopUpDto) {
    if (client.planType !== PlanType.prepaid) {
      throw new BadRequestException(this.i18n.t('billing.PREPAID_ONLY'));
    }

    const updatedClient = await this.billingRepository.incrementBalance(
      client.id,
      dto.amount,
    );

    await this.recordTransaction.execute({
      clientId: client.id,
      type: TransactionType.credit,
      amount: dto.amount,
      description: this.recordTransaction.buildDescription(
        TransactionType.credit,
      ),
      balanceAfter: updatedClient.balance,
    });

    return {
      balance: updatedClient.balance,
    };
  }
}
