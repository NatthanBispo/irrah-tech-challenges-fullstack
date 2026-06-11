import { BadRequestException, Injectable } from '@nestjs/common';
import { Client, PlanType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { BillingRepository } from '../repositories/billing.repository';
import { UpdateLimitDto } from '../dto/update-limit.dto';

@Injectable()
export class UpdateLimitService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(client: Client, dto: UpdateLimitDto) {
    if (client.planType !== PlanType.postpaid) {
      throw new BadRequestException(
        this.i18n.t('billing.POSTPAID_ONLY'),
      );
    }

    const current = await this.billingRepository.findClientById(client.id);

    if (dto.limit < current.monthlyUsage) {
      throw new BadRequestException(
        this.i18n.t('billing.LIMIT_BELOW_USAGE'),
      );
    }

    const updated = await this.billingRepository.updateLimit(
      client.id,
      dto.limit,
    );

    return { limit: updated.limit };
  }
}
