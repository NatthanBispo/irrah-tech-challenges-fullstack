import {
  MessagePriority,
  MessageStatus,
  PlanType,
  PrismaClient,
  SenderType,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_CLIENT_DOCUMENT = '39053344705';
const DEMO_POSTPAID_DOCUMENT = '11222333000181';
const DEMO_BALANCE_CENTS = 5000;
const POSTPAID_LIMIT_CENTS = 10_000;
const MESSAGE_COST_CENTS = {
  [MessagePriority.normal]: 25,
  [MessagePriority.urgent]: 50,
} as const;

async function main() {
  const recipients = await Promise.all([
    prisma.recipient.upsert({
      where: { id: '00000000-0000-4000-8000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Maria Silva',
      },
    }),
    prisma.recipient.upsert({
      where: { id: '00000000-0000-4000-8000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000002',
        name: 'João Santos',
      },
    }),
    prisma.recipient.upsert({
      where: { id: '00000000-0000-4000-8000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000003',
        name: 'Ana Costa',
      },
    }),
  ]);

  let client = await prisma.client.findUnique({
    where: { documentId: DEMO_CLIENT_DOCUMENT },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Empresa Demo BCB',
        documentId: DEMO_CLIENT_DOCUMENT,
        documentType: 'CPF',
        planType: PlanType.prepaid,
        balance: DEMO_BALANCE_CENTS,
        limit: 0,
        monthlyUsage: 0,
        active: true,
      },
    });
  } else if (client.planType === PlanType.prepaid && client.balance < 1000) {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { balance: DEMO_BALANCE_CENTS },
    });
  }

  const now = Date.now();
  const conversationData = [
    {
      recipient: recipients[0],
      unreadCount: +2,
      messages: [
        {
          content: 'Olá, preciso de ajuda com meu pedido.',
          priority: MessagePriority.normal,
          status: MessageStatus.delivered,
          sentByType: SenderType.user,
          offsetMinutes: 120,
        },
        {
          content: 'Claro! Qual é o número do pedido?',
          priority: MessagePriority.normal,
          status: MessageStatus.delivered,
          sentByType: SenderType.client,
          offsetMinutes: 115,
        },
        {
          content: 'Pedido #12345',
          priority: MessagePriority.normal,
          status: MessageStatus.delivered,
          sentByType: SenderType.user,
          offsetMinutes: 110,
        },
        {
          content: 'Estou verificando agora, um momento.',
          priority: MessagePriority.normal,
          status: MessageStatus.sent,
          sentByType: SenderType.client,
          offsetMinutes: 5,
        },
      ],
    },
    {
      recipient: recipients[1],
      unreadCount: 0,
      messages: [
        {
          content: 'Bom dia! Tudo certo com a entrega?',
          priority: MessagePriority.urgent,
          status: MessageStatus.delivered,
          sentByType: SenderType.client,
          offsetMinutes: 1440,
        },
        {
          content: 'Sim, recebi ontem. Obrigado!',
          priority: MessagePriority.normal,
          status: MessageStatus.read,
          sentByType: SenderType.user,
          offsetMinutes: 1430,
        },
      ],
    },
  ];

  for (const item of conversationData) {
    const conversation = await prisma.conversation.upsert({
      where: {
        clientId_recipientId: {
          clientId: client.id,
          recipientId: item.recipient.id,
        },
      },
      update: { unreadCount: item.unreadCount },
      create: {
        clientId: client.id,
        recipientId: item.recipient.id,
        unreadCount: item.unreadCount,
      },
    });

    const existingMessages = await prisma.message.count({
      where: { conversationId: conversation.id },
    });

    if (existingMessages === 0) {
      for (const msg of item.messages) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: msg.content,
            priority: msg.priority,
            status: msg.status,
            cost: MESSAGE_COST_CENTS[msg.priority],
            sentById:
              msg.sentByType === SenderType.client ? client.id : item.recipient.id,
            sentByType: msg.sentByType,
            timestamp: new Date(now - msg.offsetMinutes * 60 * 1000),
          },
        });
      }
    }
  }

  console.log('Seed concluído com recipients, conversas e mensagens demo.');
  console.log(`Cliente demo pré-pago: CPF ${DEMO_CLIENT_DOCUMENT}`);

  const postpaidClient = await prisma.client.upsert({
    where: { documentId: DEMO_POSTPAID_DOCUMENT },
    update: {},
    create: {
      name: 'Tech Solutions Demo',
      documentId: DEMO_POSTPAID_DOCUMENT,
      documentType: 'CNPJ',
      planType: PlanType.postpaid,
      balance: 0,
      limit: POSTPAID_LIMIT_CENTS,
      monthlyUsage: 9975,
      active: true,
    },
  });

  console.log(`Cliente demo pós-pago: CNPJ ${DEMO_POSTPAID_DOCUMENT} (limite quase esgotado)`);
  console.log(`ID pós-pago: ${postpaidClient.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
