# Big Chat Brasil (BCB) - Fullstack

Solução do desafio técnico BCB — plataforma de chat para empresas comunicarem com clientes finais.

## Stack

- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL + Socket.IO
- **Frontend:** React + TypeScript + Vite + TanStack Query + Tailwind CSS + socket.io-client
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
│       ├── messages/        # POST /messages + fila/worker + WebSocket gateway
│       ├── billing/         # top-up, balance, limite, conversão de plano
│       ├── transactions/    # GET /transactions (histórico financeiro)
│       └── recipients/      # GET /recipients
├── Frontend/
│   └── src/features/        # auth, conversations, messages, billing
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
| GET | `/billing/balance` | Consulta saldo ou consumo (Bearer) |
| POST | `/billing/top-up` | Recarga de saldo — pré-pago (Bearer) |
| PATCH | `/billing/limit` | Ajusta limite mensal — pós-pago (Bearer) |
| POST | `/billing/plan-conversion` | Converte entre planos (Bearer) |
| GET | `/transactions` | Histórico de transações financeiras (Bearer) |

### WebSocket

O backend expõe um namespace Socket.IO em `ws://localhost:3000/messages`. O frontend conecta automaticamente ao entrar no dashboard, passando o token (`client.id`) no handshake. Eventos emitidos pelo servidor:

| Evento | Payload | Quando |
|--------|---------|--------|
| `message:status_updated` | `{ messageId, conversationId, status }` | A cada transição de status na fila |
| `message:new_reply` | `{ conversationId }` | Quando a resposta automática é criada |

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

**Backend:** auth, conversas, mensagens, fila com prioridade, validação financeira, billing (top-up / limite / conversão), histórico de transações, WebSocket gateway, PostgreSQL, Swagger, seed, testes unitários (64 specs)

**Frontend:** login, cadastro, dashboard, lista de conversas, chat com histórico/envio, status visuais, filtro SMS/WhatsApp por cor, billing panel, layout responsivo, testes unitários (58 specs)

**Integração:** fluxo completo login → conversas → mensagens; atualizações em tempo real via **WebSocket** (polling a cada 15 s como fallback); tratamento 401/402
