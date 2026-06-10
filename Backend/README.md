# Backend - Big Chat Brasil

API NestJS.

## Scripts

```bash
npm run start:dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm test
npm run test:e2e   # aplica migrations + seed automaticamente (requer Postgres rodando)
```

## Módulos

| Módulo | Rota | Status |
|--------|------|--------|
| auth | `POST /auth` | Implementado |

## Dados de teste (seed)

| Documento | Tipo | Plano |
|-----------|------|-------|
| `12345678901` | CPF | Pré-pago |
| `12345678000199` | CNPJ | Pós-pago |
