import { Module } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { RecipientsController } from './controllers/recipients.controller';
import { RecipientsRepository } from './repositories/recipients.repository';
import { ListRecipientsService } from './services/list-recipients.service';

@Module({
  controllers: [RecipientsController],
  providers: [ListRecipientsService, RecipientsRepository, AuthGuard],
})
export class RecipientsModule {}
