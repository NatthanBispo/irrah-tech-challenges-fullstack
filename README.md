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
│       ├── auth/              # Autenticação (implementado)
│       └── prisma/
├── Frontend/
│   └── src/
│       ├── api/
│       ├── pages/
│       └── types/
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
- [ ] Conversas e mensagens
- [ ] Fila de mensagens
- [ ] Validação financeira

**Frontend:**
- [ ] Tela de login
- [ ] Lista de conversas
- [ ] Interface de chat

## Dados de teste (seed)

| Documento | Tipo | Plano |
|-----------|------|-------|
| `12345678901` | CPF | Pré-pago (R$ 50,00) |
| `12345678000199` | CNPJ | Pós-pago (limite R$ 100,00) |
