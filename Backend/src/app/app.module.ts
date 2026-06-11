import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { AuthModule } from '../modules/auth/auth.module';
import { BillingModule } from '../modules/billing/billing.module';
import { ConversationsModule } from '../modules/conversations/conversations.module';
import { MessagesModule } from '../modules/messages/messages.module';
import { RecipientsModule } from '../modules/recipients/recipients.module';
import { TransactionsModule } from '../modules/transactions/transactions.module';
import { PrismaModule } from '../shared/database/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    BillingModule,
    ConversationsModule,
    MessagesModule,
    RecipientsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
