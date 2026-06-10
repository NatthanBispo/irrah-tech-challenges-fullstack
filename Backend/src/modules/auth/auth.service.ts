import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../shared/database/prisma.service';
import { ClientEntity } from '../../shared/utils/types';
import { AuthRequestDto } from './dto/auth-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async authenticate(dto: AuthRequestDto) {
    const client = await this.prisma.client.findFirst({
      where: {
        documentId: dto.documentId,
        documentType: dto.documentType,
      },
    });

    if (!client) {
      throw new NotFoundException(this.i18n.t('auth.CLIENT_NOT_FOUND'));
    }

    if (!client.active) {
      throw new NotFoundException(this.i18n.t('auth.CLIENT_INACTIVE'));
    }

    return {
      token: client.id,
      client: this.mapClient(client),
    };
  }

  private mapClient(client: ClientEntity) {
    return {
      id: client.id,
      name: client.name,
      documentId: client.documentId,
      documentType: client.documentType,
      balance: client.planType === 'prepaid' ? Number(client.balance) : undefined,
      limit: client.planType === 'postpaid' ? Number(client.limit) : undefined,
      planType: client.planType,
      active: client.active,
    };
  }
}
