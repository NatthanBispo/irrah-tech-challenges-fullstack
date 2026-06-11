import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../shared/database/prisma.service';
import { PlanType } from '../../shared/utils/enums';
import { ClientEntity } from '../../shared/utils/types';
import { AuthRequestDto } from './dto/auth-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

const DEFAULT_POSTPAID_LIMIT = 100;

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

    if (!client || !client.active) {
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_CREDENTIALS'),
      );
    }

    return this.buildAuthResponse(client);
  }

  async register(dto: RegisterRequestDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { documentId: dto.documentId },
    });

    if (existingClient) {
      throw new ConflictException(
        this.i18n.t('auth.DOCUMENT_ALREADY_EXISTS'),
      );
    }

    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        documentId: dto.documentId,
        documentType: dto.documentType,
        planType: dto.planType,
        balance: 0,
        limit: dto.planType === PlanType.postpaid ? DEFAULT_POSTPAID_LIMIT : 0,
        monthlyUsage: 0,
        active: true,
      },
    });

    return this.buildAuthResponse(client);
  }

  private buildAuthResponse(client: ClientEntity) {
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
