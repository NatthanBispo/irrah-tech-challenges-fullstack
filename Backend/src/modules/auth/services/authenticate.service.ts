import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthRequestDto } from '../dto/auth-request.dto';
import { ClientsRepository } from '../repositories/clients.repository';
import { buildAuthResponse } from './auth-response.mapper';

@Injectable()
export class AuthenticateService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: AuthRequestDto) {
    const client = await this.clientsRepository.findByDocument(
      dto.documentId,
      dto.documentType,
    );

    if (!client || !client.active) {
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_CREDENTIALS'),
      );
    }

    return buildAuthResponse(client);
  }
}
