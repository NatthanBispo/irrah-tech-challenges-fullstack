# Frontend - Big Chat Brasil

Aplicação React com Vite, TanStack Query e Tailwind CSS.

## Scripts

```bash
npm run dev
npm run build
npm test
```

## Variáveis de ambiente

Copie `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

## Rotas

| Rota | Tela |
|------|------|
| `/login` | Identificação por CPF/CNPJ |
| `/register` | Cadastro com plano pré/pós-pago |
| `/dashboard` | Lista de conversas |
| `/dashboard/:conversationId` | Chat com histórico e envio |
| `/dashboard/new/:recipientId` | Nova conversa com destinatário |

> A spec do desafio usa `/conversations`; esta implementação usa `/dashboard` com a mesma função.

## Funcionalidades

- Layout responsivo (split desktop, telas separadas no mobile)
- Polling de mensagens e lista de conversas (3s)
- Badges de status (queued → delivered)
- Tratamento de erro 401 (logout) e 402 (saldo/limite)

## Demo

Login com CPF `39053344705` (cliente do seed do backend).
