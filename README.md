# Big Chat Brasil (BCB) - Fullstack

Solução do desafio técnico BCB.

## Stack

- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend:** React + TypeScript + Vite + TanStack Query + Tailwind CSS
- **Infra:** Docker Compose

## Estrutura

```
.
├── Backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── modules/auth/      # Autenticação e cadastro
│       └── shared/
├── Frontend/
│   └── src/
│       ├── features/auth/
│       ├── app/
│       └── shared/
└── docker-compose.yml
```

## Como executar

### Com Docker

```bash
docker-compose up --build
```

### Localmente

```bash
# Banco
docker-compose up postgres -d

# Backend
cd Backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend
cd Frontend
cp .env.example .env
npm install
npm run dev
```

## Acessos

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |

## Status

**Backend:**
- [x] Autenticação por CPF/CNPJ (`POST /auth`)
- [x] Cadastro de cliente com escolha de plano (`POST /auth/register`)
- [ ] Conversas e mensagens
- [ ] Fila de mensagens
- [ ] Validação financeira

**Frontend:**
- [x] Tela de login
- [x] Tela de cadastro com escolha de plano
- [ ] Lista de conversas
- [ ] Interface de chat

## Cadastro de cliente

Endpoint: `POST /auth/register`

```json
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

Após o cadastro, a API retorna `{ token, client }` e o frontend redireciona automaticamente para o dashboard.
