import { DocumentType, PlanType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.client.upsert({
    where: { documentId: '12345678901' },
    update: {
      name: 'Empresa ABC Ltda',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
      balance: 50.0,
      active: true,
    },
    create: {
      name: 'Empresa ABC Ltda',
      documentId: '12345678901',
      documentType: DocumentType.CPF,
      planType: PlanType.prepaid,
      balance: 50.0,
      active: true,
    },
  });

  await prisma.client.upsert({
    where: { documentId: '12345678000199' },
    update: {
      name: 'Tech Solutions S.A.',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      limit: 100.0,
      monthlyUsage: 0,
      active: true,
    },
    create: {
      name: 'Tech Solutions S.A.',
      documentId: '12345678000199',
      documentType: DocumentType.CNPJ,
      planType: PlanType.postpaid,
      limit: 100.0,
      active: true,
    },
  });

  console.log('Seed concluído.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
