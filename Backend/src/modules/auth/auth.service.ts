import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ClientEntity } from '../../shared/utils/types';
import { AuthRequestDto } from './dto/auth-request.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async authenticate(dto: AuthRequestDto) {
    const client = await this.prisma.client.findFirst({
      where: {
        documentId: dto.documentId,
        documentType: dto.documentType,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (!client.active) {
      throw new NotFoundException('Cliente inativo');
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
