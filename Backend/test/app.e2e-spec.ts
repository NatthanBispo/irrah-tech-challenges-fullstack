import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from 'nestjs-i18n';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app/app.module';

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
  });

  it('POST /auth autentica cliente válido', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ documentId: '12345678901', documentType: 'CPF' })
      .expect(200)
      .expect((response) => {
        expect(response.body.token).toBeDefined();
        expect(response.body.client.documentId).toBe('12345678901');
        expect(response.body.client.planType).toBe('prepaid');
        expect(response.body.client.balance).toBe(50);
      });
  });

  it('POST /auth retorna 404 para cliente inexistente', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ documentId: '00000000000', documentType: 'CPF' })
      .expect(404)
      .expect((response) => {
        expect(response.body.message).toBe('Cliente não encontrado');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
