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
npm test && npm run test:e2e   # todos os testes do backend
```

## Módulos

| Módulo | Rota | Status |
|--------|------|--------|
| auth | `POST /auth`, `POST /auth/register` | Implementado (com senha) |

## Exemplos de documentos válidos

| Documento | Tipo |
|-----------|------|
| `39053344705` | CPF |
| `11222333000181` | CNPJ |
