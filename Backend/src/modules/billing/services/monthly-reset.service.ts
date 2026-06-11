import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class MonthlyResetService {
  private readonly logger = new Logger(MonthlyResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 1 * *')
  async resetMonthlyUsage() {
    const result = await this.prisma.client.updateMany({
      where: { planType: 'postpaid' },
      data: { monthlyUsage: 0 },
    });
    this.logger.log(
      `Reset mensal realizado: ${result.count} clientes pós-pago zerados`,
    );
  }
}
