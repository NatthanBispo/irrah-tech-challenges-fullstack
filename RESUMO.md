# Big Chat Brasil (BCB) — Resumo para Entrevista

## O que é o projeto

O BCB é uma plataforma de chat para comunicação entre empresas e clientes finais, similar a um gateway de mensagens (como Twilio ou Zenvia). Uma empresa se cadastra, escolhe um plano (pré-pago ou pós-pago) e pode trocar mensagens com destinatários cadastrados. Cada mensagem tem um custo fixo e uma prioridade que influencia o tempo de entrega.

---

## Tecnologias utilizadas

### Backend
- **NestJS** (Node.js) — framework com injeção de dependência, guards, decorators e módulos
- **TypeScript** — tipagem estática em toda a base de código
- **Prisma ORM** — mapeamento de banco, migrations e geração de tipos
- **PostgreSQL** — banco relacional principal
- **@nestjs/schedule** — cron jobs (reset mensal pós-pago) e workers com `@Interval`
- **nestjs-i18n** — internacionalização das mensagens de erro e validação
- **class-validator / class-transformer** — validação dos DTOs de entrada
- **Swagger (@nestjs/swagger)** — documentação automática da API em `/docs`
- **Socket.IO (`@nestjs/websockets`, `@nestjs/platform-socket.io`)** — gateway WebSocket para push de status em tempo real
- **Jest** — testes unitários e e2e

### Frontend
- **React 19** — biblioteca de UI
- **TypeScript** — tipagem estática
- **Vite** — bundler e dev server
- **React Router 7** — roteamento com layouts aninhados
- **TanStack Query (React Query)** — cache e sincronização de dados do servidor
- **Tailwind CSS** — estilização utilitária
- **Axios** — cliente HTTP com interceptor de autenticação e tratamento de 401
- **sonner** — toasts de feedback (sucesso/erro)
- **socket.io-client** — conexão WebSocket para receber atualizações de status em tempo real
- **react-i18next** — internacionalização
- **Vitest + React Testing Library** — testes unitários de componentes e hooks

### Infraestrutura
- **Docker + Docker Compose** — orquestra backend, frontend e PostgreSQL num único comando
- O backend executa `prisma migrate deploy` e `prisma db seed` automaticamente ao subir

---

## Arquitetura do backend

Organizado em módulos NestJS por domínio, cada um com a estrutura:

```
módulo/
├── controllers/   # recebe HTTP, delega ao service
├── services/      # uma classe por caso de uso
├── repositories/  # abstração do Prisma por entidade
├── gateways/      # WebSocket gateway (apenas em messages/)
├── dto/           # validação de entrada e forma da resposta
└── entities/      # tipos de domínio
```

**Módulos:**
| Módulo | Responsabilidade |
|--------|-----------------|
| `auth` | Login por CPF/CNPJ e cadastro com plano |
| `conversations` | Listar conversas e histórico de mensagens |
| `messages` | Enviar mensagem, fila de prioridade, worker de entrega |
| `billing` | Recarga, consulta de saldo, ajuste de limite, conversão de plano |
| `transactions` | Histórico de transações financeiras |
| `recipients` | Listar destinatários disponíveis |

---

## Como funciona o sistema de mensagens e fila

1. Cliente chama `POST /messages` com `content`, `priority` (`normal`/`urgent`) e `type` (`whatsapp`/`sms`)
2. O backend valida o saldo (pré-pago) ou o limite mensal (pós-pago), debita o custo e persiste a mensagem com status `queued`
3. O ID da mensagem é inserido na fila in-memory (`MessageQueueService`), que mantém dois arrays: `urgentQueue[]` e `normalQueue[]`
4. O `QueueWorkerService` roda a cada 2 segundos e chama `dequeue()` — urgentes são sempre processadas antes das normais (strict priority)
5. A mensagem passa pelos status: `queued → processing → sent → delivered`
6. Ao subir o servidor, a fila é hidratada do banco, recuperando mensagens `queued` que existiam antes de um eventual restart
7. A cada mudança de status, o `QueueWorkerService` emite um evento WebSocket (`message:status_updated`) para a room do cliente, fazendo o frontend atualizar em tempo real sem necessidade de reload

**Custos:**
- Mensagem normal: R$ 0,25 (25 centavos)
- Mensagem urgente: R$ 0,50 (50 centavos)

Todos os valores são armazenados em **centavos** (inteiros) para evitar arredondamento de ponto flutuante.

---

## Como funciona o sistema financeiro

### Pré-pago
- Cliente tem `balance` em centavos
- Antes de enviar: `balance >= cost` → debita → registra transação `debit`
- Recarga via `POST /billing/top-up` → registra transação `credit`

### Pós-pago
- Cliente tem `limit` (limite mensal) e `monthlyUsage` (consumo acumulado)
- Antes de enviar: `monthlyUsage + cost <= limit` → incrementa `monthlyUsage` → registra transação `postpaid_charge`
- Ajuste de limite via `PATCH /billing/limit` (validado: não pode ficar abaixo do consumo atual)
- Reset do `monthlyUsage` para zero todo dia 1º às 00:00 via cron job

### Conversão de plano (`POST /billing/plan-conversion`)
- **Pré → Pós:** saldo residual é registrado como transação `plan_conversion_credit`, balance vai a zero, limite padrão de R$ 100,00 é aplicado
- **Pós → Pré:** consumo pendente é registrado como transação `postpaid_settlement`, `monthlyUsage` e `limit` vão a zero

Todas as operações que afetam saldo e criam transação rodam dentro de uma única `$transaction` Prisma para garantir atomicidade.

---

## Como funciona a autenticação

- Sem senha: o cliente se identifica apenas pelo número do documento (CPF ou CNPJ)
- O token retornado é o próprio `client.id` (UUID) — simples, sem expiração, para facilitar o demo
- O frontend guarda o token no `localStorage` e o envia em todas as requisições como `Authorization: Bearer <token>`
- Um `AuthGuard` no backend valida o token buscando o cliente no banco a cada request
- Um interceptor Axios no frontend captura respostas `401` e redireciona para o login automaticamente

---

## Como funciona o frontend

O frontend segue uma arquitetura orientada a features:

```
features/
├── auth/         # login, cadastro, contexto de sessão
├── conversations/ # lista de conversas, item com unreadCount
├── messages/     # bolhas de chat, composer, status badge, filtro SMS/WhatsApp
└── billing/      # recarga, ajuste de limite, conversão de plano, histórico
```

**Fluxo principal:**
1. Usuário faz login → `AuthContext` salva token e dados do cliente no estado global
2. Dashboard conecta ao WebSocket (`useMessageSocket`) e carrega lista de conversas via `useConversations`
3. Ao abrir uma conversa, `useMessages` carrega o histórico — o backend marca mensagens não lidas como `read` automaticamente
4. Ao enviar mensagem, `useSendMessage` chama a API e atualiza otimisticamente o estado local:
   - Pré-pago: `balance` é atualizado com `currentBalance` retornado pela API
   - Pós-pago: `monthlyUsage` é incrementado localmente com o `cost` retornado
5. O WebSocket recebe `message:status_updated` e invalida o cache TanStack Query da conversa, forçando a atualização do status na tela
6. O header do dashboard exibe: saldo (pré-pago) ou "Consumo: R$ X de R$ Y" (pós-pago)
7. O chat exibe bolhas com cor diferente por tipo: **verde** (WhatsApp) e **azul** (SMS), com filtro por tipo no topo da conversa

---

## Testes

| Camada | Ferramenta | Cobertura |
|--------|-----------|-----------|
| Backend unitário | Jest | 64 testes — services de auth, billing, transactions, messages, conversations, gateway |
| Frontend unitário | Vitest + RTL | 58 testes — componentes, hooks, utils, contexto, serviços |

Os testes unitários mockam todas as dependências externas (Prisma, API) e testam a lógica de negócio isolada.

---

## Endpoints principais

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth` | — | Login por documento |
| POST | `/auth/register` | — | Cadastro com plano |
| GET | `/conversations` | Bearer | Lista conversas do cliente |
| GET | `/conversations/:id/messages` | Bearer | Histórico de mensagens |
| POST | `/messages` | Bearer | Envia mensagem (debita saldo) |
| GET | `/recipients` | Bearer | Lista destinatários disponíveis |
| POST | `/billing/top-up` | Bearer | Recarga de saldo (pré-pago) |
| GET | `/billing/balance` | Bearer | Consulta saldo ou consumo |
| PATCH | `/billing/limit` | Bearer | Ajusta limite mensal (pós-pago) |
| POST | `/billing/plan-conversion` | Bearer | Converte entre planos |
| GET | `/transactions` | Bearer | Histórico de transações |

Documentação interativa disponível em `http://localhost:3000/docs` (Swagger).

---

## Como rodar

```bash
# Sobe tudo (backend + frontend + postgres)
docker compose up --build

# Ou localmente:
cd Backend && npm install && npm run start:dev
cd Frontend && npm install && npm run dev
```

**Conta de demo (seed):** CPF `39053344705` — plano pré-pago, saldo R$ 50,00, 2 conversas criadas.
