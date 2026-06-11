import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from 'nestjs-i18n';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app/app.module';
import { PrismaService } from './../src/shared/database/prisma.service';

describe('BCB API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new I18nValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new I18nValidationExceptionFilter());
    await app.init();

    const prisma = app.get(PrismaService);
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.client.deleteMany();
    await prisma.recipient.deleteMany();
  });

  it('POST /auth/register cadastra cliente pré-pago', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Empresa ABC',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.token).toBeDefined();
        expect(response.body.client.name).toBe('Empresa ABC');
        expect(response.body.client.documentId).toBe('39053344705');
        expect(response.body.client.planType).toBe('prepaid');
        expect(response.body.client.balance).toBe(0);
      });
  });

  it('POST /auth/register cadastra cliente pós-pago com limite padrão', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Tech Solutions',
        documentId: '11222333000181',
        documentType: 'CNPJ',
        planType: 'postpaid',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.client.planType).toBe('postpaid');
        expect(response.body.client.limit).toBe(10000);
      });
  });

  it('POST /auth autentica cliente cadastrado', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Login',
        documentId: '98765432100',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '98765432100',
        documentType: 'CPF',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.token).toBeDefined();
        expect(response.body.client.documentId).toBe('98765432100');
      });
  });

  it('POST /auth/register retorna 409 para documento duplicado', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Primeiro Cliente',
        documentId: '11144477735',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Segundo Cliente',
        documentId: '11144477735',
        documentType: 'CPF',
        planType: 'postpaid',
      })
      .expect(409)
      .expect((response) => {
        expect(response.body.message).toBe('Documento já cadastrado');
      });
  });

  it('POST /auth retorna 401 para cliente inexistente', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '52998224725',
        documentType: 'CPF',
      })
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe(
          'Documento não encontrado ou cliente inativo',
        );
      });
  });

  it('POST /auth retorna 400 para CPF inválido', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '12345678901',
        documentType: 'CPF',
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.message[0].constraints.isValidDocument).toBe(
          'Informe um CPF válido',
        );
      });
  });

  it('fluxo de chat: listar conversas, mensagens e enviar', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Chat',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;
    const clientId = registerResponse.body.client.id as string;
    const prisma = app.get(PrismaService);

    await prisma.client.update({
      where: { id: clientId },
      data: { balance: 1000 },
    });

    const recipient = await prisma.recipient.create({
      data: { name: 'Maria Silva' },
    });

    const sendResponse = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId: recipient.id,
        content: 'Olá, preciso de ajuda!',
        priority: 'normal',
      })
      .expect(201);

    expect(sendResponse.body.status).toBe('queued');
    expect(sendResponse.body.cost).toBe(25);
    expect(sendResponse.body.currentBalance).toBe(975);

    const conversationsResponse = await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(conversationsResponse.body).toHaveLength(1);
    expect(conversationsResponse.body[0].recipientName).toBe('Maria Silva');

    const conversationId = conversationsResponse.body[0].id as string;

    const messagesResponse = await request(app.getHttpServer())
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(messagesResponse.body).toHaveLength(1);
    expect(messagesResponse.body[0].content).toBe('Olá, preciso de ajuda!');
    expect(messagesResponse.body[0].status).toBe('queued');
  });

  it('GET /conversations retorna 401 sem token', () => {
    return request(app.getHttpServer()).get('/conversations').expect(401);
  });

  it('POST /billing/top-up adiciona saldo para cliente pré-pago', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Recarga',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;

    return request(app.getHttpServer())
      .post('/billing/top-up')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 2500 })
      .expect(201)
      .expect((response) => {
        expect(response.body.balance).toBe(2500);
      });
  });

  it('POST /billing/top-up retorna 400 para cliente pós-pago', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Pos Recarga',
        documentId: '11222333000181',
        documentType: 'CNPJ',
        planType: 'postpaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;

    return request(app.getHttpServer())
      .post('/billing/top-up')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10 })
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toBe(
          'Recarga de saldo disponível apenas para clientes pré-pago',
        );
      });
  });

  it('POST /messages retorna 402 com saldo insuficiente', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Sem Saldo',
        documentId: '11144477735',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;
    const prisma = app.get(PrismaService);

    const recipient = await prisma.recipient.create({
      data: { name: 'João Santos' },
    });

    const conversation = await prisma.conversation.create({
      data: {
        clientId: registerResponse.body.client.id,
        recipientId: recipient.id,
      },
    });

    return request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: conversation.id,
        content: 'Mensagem sem saldo',
        priority: 'normal',
      })
      .expect(402);
  });

  it('POST /messages retorna 402 com limite mensal excedido', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Pos Pago',
        documentId: '11222333000181',
        documentType: 'CNPJ',
        planType: 'postpaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;
    const prisma = app.get(PrismaService);

    await prisma.client.update({
      where: { id: registerResponse.body.client.id },
      data: { monthlyUsage: 10000 },
    });

    const recipient = await prisma.recipient.create({
      data: { name: 'Ana Costa' },
    });

    const conversation = await prisma.conversation.create({
      data: {
        clientId: registerResponse.body.client.id,
        recipientId: recipient.id,
      },
    });

    return request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: conversation.id,
        content: 'Mensagem acima do limite',
        priority: 'normal',
      })
      .expect(402)
      .expect((response) => {
        expect(response.body.message).toBe('Limite mensal excedido');
      });
  });

  it('POST /messages pós-pago incrementa monthlyUsage com sucesso', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Pos Pago OK',
        documentId: '11222333000181',
        documentType: 'CNPJ',
        planType: 'postpaid',
      })
      .expect(201);

    const token = registerResponse.body.token as string;
    const clientId = registerResponse.body.client.id as string;
    const prisma = app.get(PrismaService);

    const recipient = await prisma.recipient.create({
      data: { name: 'Maria Silva' },
    });

    const conversation = await prisma.conversation.create({
      data: {
        clientId,
        recipientId: recipient.id,
      },
    });

    const normalResponse = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: conversation.id,
        content: 'Mensagem normal pós-pago',
        priority: 'normal',
      })
      .expect(201);

    expect(normalResponse.body.cost).toBe(25);
    expect(normalResponse.body.currentBalance).toBeUndefined();

    let client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } });
    expect(client.monthlyUsage).toBe(25);

    const urgentResponse = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: conversation.id,
        content: 'Mensagem urgente pós-pago',
        priority: 'urgent',
      })
      .expect(201);

    expect(urgentResponse.body.cost).toBe(50);

    client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } });
    expect(client.monthlyUsage).toBe(75);
  });

  it('POST /auth retorna 401 para cliente inativo', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Inativo',
        documentId: '11144477735',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(201);

    const prisma = app.get(PrismaService);
    await prisma.client.update({
      where: { documentId: '11144477735' },
      data: { active: false },
    });

    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '11144477735',
        documentType: 'CPF',
      })
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe(
          'Documento não encontrado ou cliente inativo',
        );
      });
  });

  it(
    'mensagem evolui de queued para delivered após processamento da fila',
    async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Cliente Status',
          documentId: '39053344705',
          documentType: 'CPF',
          planType: 'prepaid',
        })
        .expect(201);

      const token = registerResponse.body.token as string;
      const clientId = registerResponse.body.client.id as string;
      const prisma = app.get(PrismaService);

      await prisma.client.update({
        where: { id: clientId },
        data: { balance: 1000 },
      });

      const recipient = await prisma.recipient.create({
        data: { name: 'Status Test' },
      });

      const sendResponse = await request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId: recipient.id,
          content: 'Teste de status',
          priority: 'normal',
        })
        .expect(201);

      const conversationsResponse = await request(app.getHttpServer())
        .get('/conversations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const conversationId = conversationsResponse.body[0].id as string;

      const initialMessages = await request(app.getHttpServer())
        .get(`/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(initialMessages.body[0].status).toBe('queued');

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const finalMessages = await request(app.getHttpServer())
        .get(`/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const sentMessage = finalMessages.body.find(
        (message: { id: string }) => message.id === sendResponse.body.id,
      );

      expect(sentMessage.status).toBe('delivered');
    },
    10000,
  );

  afterEach(async () => {
    await app.close();
  });
});
