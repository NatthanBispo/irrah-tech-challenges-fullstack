export type DocumentType = 'CPF' | 'CNPJ';
export type PlanType = 'prepaid' | 'postpaid';
export type MessagePriority = 'normal' | 'urgent';
export type MessageType = 'sms' | 'whatsapp';
export type MessageStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';
export type SenderType = 'client' | 'user';

export interface Client {
  id: string;
  name: string;
  documentId: string;
  documentType: DocumentType;
  planType: PlanType;
  /** Saldo em centavos (pré-pago) */
  balance?: number;
  /** Limite mensal em centavos (pós-pago) */
  limit?: number;
  /** Consumo mensal em centavos (pós-pago) */
  monthlyUsage?: number;
  active: boolean;
}

export interface AuthRequest {
  documentId: string;
  documentType: DocumentType;
}

export interface AuthResponse {
  token: string;
  client: Client;
}

export interface RegisterPayload {
  name: string;
  documentId: string;
  documentType: DocumentType;
  planType: PlanType;
}

export interface ConversationResponse {
  id: string;
  recipientId: string;
  recipientName: string;
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
}

/** @deprecated Use ConversationResponse */
export type Conversation = ConversationResponse;

export interface MessageResponse {
  id: string;
  conversationId: string;
  content: string;
  sentBy: {
    id: string;
    type: SenderType;
  };
  timestamp: string;
  priority: MessagePriority;
  status: MessageStatus;
  /** Custo em centavos */
  cost: number;
  type: MessageType;
}

/** @deprecated Use MessageResponse */
export type Message = MessageResponse;

export interface Recipient {
  id: string;
  name: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  recipientId?: string;
  content: string;
  priority: MessagePriority;
  type?: MessageType;
}

export interface TransactionResponse {
  id: string;
  type: 'debit' | 'credit' | 'postpaid_charge' | 'plan_conversion_credit' | 'postpaid_settlement';
  amount: number;
  description: string;
  balanceAfter?: number | null;
  messageId?: string | null;
  createdAt: string;
}

export interface BalanceResponse {
  planType: PlanType;
  balance?: number;
  limit?: number;
  monthlyUsage?: number;
  available?: number;
}

export interface ConvertPlanRequest {
  planType: PlanType;
}

export interface UpdateLimitRequest {
  limit: number;
}

export interface SendMessageResponse {
  id: string;
  status: 'queued';
  timestamp: string;
  estimatedDelivery: string;
  /** Custo em centavos */
  cost: number;
  /** Saldo restante em centavos (pré-pago) */
  currentBalance?: number;
}
