import { ConflictException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PlanType } from '../../../shared/utils/enums';
import { DEFAULT_POSTPAID_LIMIT_CENTS } from '../../../shared/utils/money';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { ClientsRepository } from '../repositories/clients.repository';
import { buildAuthResponse } from './auth-response.mapper';

const DEFAULT_POSTPAID_LIMIT = DEFAULT_POSTPAID_LIMIT_CENTS;

@Injectable()
export class RegisterService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: RegisterRequestDto) {
    const existingClient = await this.clientsRepository.findByDocumentId(
      dto.documentId,
    );

    if (existingClient) {
      throw new ConflictException(
        this.i18n.t('auth.DOCUMENT_ALREADY_EXISTS'),
      );
    }

    const client = await this.clientsRepository.create({
      name: dto.name,
      documentId: dto.documentId,
      documentType: dto.documentType,
      planType: dto.planType,
      balance: 0,
      limit: dto.planType === PlanType.postpaid ? DEFAULT_POSTPAID_LIMIT : 0,
      monthlyUsage: 0,
      active: true,
    });

    return buildAuthResponse(client);
  }
}
