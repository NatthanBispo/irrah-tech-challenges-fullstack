# Backend - Big Chat Brasil

API NestJS com Prisma e PostgreSQL.

## Scripts

```bash
npm run start:dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm test
npm run test:e2e
```

## Módulos

| Módulo | Rotas | Descrição |
|--------|-------|-----------|
| auth | `POST /auth`, `POST /auth/register` | Identificação por CPF/CNPJ |
| conversations | `GET /conversations`, `GET /conversations/:id/messages` | Lista e histórico |
| messages | `POST /messages` | Envio com fila e validação financeira |
| recipients | `GET /recipients` | Destinatários para nova conversa |

Swagger: http://localhost:3000/docs

## Autenticação

Token Bearer = `client.id` (UUID retornado no login). Sem senha.

## Seed demo

- CPF `39053344705` — pré-pago, saldo R$ 50
- CNPJ `11222333000181` — pós-pago, limite R$ 100/mês
- 3 destinatários com conversas e mensagens de exemplo

## Documentos válidos para testes

| Documento | Tipo |
|-----------|------|
| `39053344705` | CPF |
| `11222333000181` | CNPJ |
