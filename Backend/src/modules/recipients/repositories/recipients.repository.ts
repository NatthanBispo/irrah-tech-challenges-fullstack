import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class RecipientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.recipient.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
