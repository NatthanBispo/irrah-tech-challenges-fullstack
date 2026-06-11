import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DocumentType, PlanType } from '../../../shared/utils/enums';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByDocument(documentId: string, documentType: DocumentType) {
    return this.prisma.client.findFirst({
      where: {
        documentId,
        documentType,
      },
    });
  }

  findByDocumentId(documentId: string) {
    return this.prisma.client.findUnique({
      where: { documentId },
    });
  }

  create(data: {
    name: string;
    documentId: string;
    documentType: DocumentType;
    planType: PlanType;
    balance: number;
    limit: number;
    monthlyUsage: number;
    active: boolean;
  }) {
    return this.prisma.client.create({ data });
  }
}
