# Big Chat Brasil (BCB) - Fullstack

Solução do desafio técnico BCB — plataforma de chat para empresas comunicarem com clientes finais.

## Stack

- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend:** React + TypeScript + Vite + TanStack Query + Tailwind CSS
- **Infra:** Docker Compose

## Premissas

- Autenticação por **CPF/CNPJ** (sem senha); token = UUID do cliente (`client.id`)
- Mensagens normais custam **R$ 0,25**; urgentes **R$ 0,50**
- Fila in-memory com prioridade (urgente > normal) e worker simulando envio
- Cliente demo no seed: CPF **39053344705** (saldo R$ 50,00, 2 conversas)

## Estrutura

```
.
├── Backend/
│   ├── prisma/              # Schema, migrations, seed
│   └── src/modules/
│       ├── auth/            # POST /auth, POST /auth/register
│       ├── conversations/   # GET /conversations, GET /:id/messages
│       ├── messages/        # POST /messages + fila/worker
│       └── recipients/      # GET /recipients
├── Frontend/
│   └── src/features/        # auth, conversations, messages
└── docker-compose.yml
```

## Como executar

### Com Docker (recomendado)

```bash
docker compose up --build
```

O backend executa `prisma migrate deploy` e `prisma db seed` automaticamente.

### Localmente

```bash
docker compose up postgres -d

cd Backend && cp .env.example .env
npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed
npm run start:dev

cd Frontend && cp .env.example .env
npm install && npm run dev
```

## Acessos

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |

## Fluxo de demonstração

1. Acesse http://localhost:5173/login
2. Informe CPF `39053344705` (cliente demo do seed)
3. Veja conversas em `/dashboard`
4. Abra um chat, envie mensagem normal ou urgente
5. Observe status evoluir (Na fila → Entregue) e resposta automática do destinatário

## API principal

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth` | Login por documento |
| POST | `/auth/register` | Cadastro com plano |
| GET | `/conversations` | Lista conversas (Bearer) |
| GET | `/conversations/:id/messages` | Histórico (Bearer) |
| POST | `/messages` | Enviar mensagem (Bearer) |
| GET | `/recipients` | Destinatários para nova conversa (Bearer) |

### Login

```json
POST /auth
{ "documentId": "39053344705", "documentType": "CPF" }
```

### Cadastro

```json
POST /auth/register
{
  "name": "Empresa ABC",
  "documentId": "39053344705",
  "documentType": "CPF",
  "planType": "prepaid"
}
```

| Plano | Valor inicial |
|-------|---------------|
| Pré-pago (`prepaid`) | Saldo R$ 0,00 |
| Pós-pago (`postpaid`) | Limite mensal R$ 100,00 |

## Testes

```bash
cd Backend && npm test && npm run test:e2e
cd Frontend && npm test
```

## Status

**Backend:** auth, conversas, mensagens, fila com prioridade, validação financeira, PostgreSQL, Swagger, seed

**Frontend:** login, cadastro, dashboard com lista de conversas, chat com histórico/envio, status visuais, layout responsivo, nova conversa

**Integração:** fluxo completo login → conversas → mensagens; polling de status; tratamento 401/402
