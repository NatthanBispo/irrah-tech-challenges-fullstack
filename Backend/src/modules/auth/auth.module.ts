import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsRepository } from './repositories/clients.repository';
import { AuthenticateService } from './services/authenticate.service';
import { RegisterService } from './services/register.service';

@Module({
  controllers: [AuthController],
  providers: [AuthenticateService, RegisterService, ClientsRepository],
})
export class AuthModule {}
