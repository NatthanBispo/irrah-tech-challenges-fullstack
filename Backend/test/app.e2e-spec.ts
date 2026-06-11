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

const PASSWORD = 'Senha1234';

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
    await prisma.client.deleteMany();
  });

  it('POST /auth/register cadastra cliente pré-pago', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Empresa ABC',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
        password: PASSWORD,
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
        password: PASSWORD,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.client.planType).toBe('postpaid');
        expect(response.body.client.limit).toBe(100);
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
        password: PASSWORD,
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '98765432100',
        documentType: 'CPF',
        password: PASSWORD,
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
        password: PASSWORD,
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Segundo Cliente',
        documentId: '11144477735',
        documentType: 'CPF',
        planType: 'postpaid',
        password: PASSWORD,
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
        password: PASSWORD,
      })
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('Documento ou senha incorretos');
      });
  });

  it('POST /auth retorna 401 para senha incorreta', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Cliente Senha',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
        password: PASSWORD,
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '39053344705',
        documentType: 'CPF',
        password: 'SenhaErrada',
      })
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('Documento ou senha incorretos');
      });
  });

  it('POST /auth retorna 400 para CPF inválido', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({
        documentId: '12345678901',
        documentType: 'CPF',
        password: PASSWORD,
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.message[0].constraints.isValidDocument).toBe(
          'Informe um CPF válido',
        );
      });
  });

  it('POST /auth/register retorna 400 sem senha', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Empresa ABC',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.message[0].constraints.isNotEmpty).toBe(
          'A senha é obrigatória',
        );
      });
  });

  it('POST /auth/register retorna 400 para senha curta', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Empresa ABC',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
        password: 'curta',
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.message[0].constraints.minLength).toBe(
          'A senha deve ter pelo menos 8 caracteres',
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
