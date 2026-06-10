import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { AuthModule } from '../modules/auth/auth.module';
import { PrismaModule } from '../shared/database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
    }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
