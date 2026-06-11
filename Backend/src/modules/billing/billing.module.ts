import { Module } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { TransactionsModule } from '../transactions/transactions.module';
import { BillingController } from './controllers/billing.controller';
import { BillingRepository } from './repositories/billing.repository';
import { ConvertPlanService } from './services/convert-plan.service';
import { GetBalanceService } from './services/get-balance.service';
import { MonthlyResetService } from './services/monthly-reset.service';
import { TopUpService } from './services/top-up.service';
import { UpdateLimitService } from './services/update-limit.service';

@Module({
  imports: [TransactionsModule],
  controllers: [BillingController],
  providers: [
    TopUpService,
    GetBalanceService,
    UpdateLimitService,
    ConvertPlanService,
    MonthlyResetService,
    BillingRepository,
    AuthGuard,
  ],
})
export class BillingModule {}
