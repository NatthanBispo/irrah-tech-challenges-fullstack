export type DocumentType = 'CPF' | 'CNPJ';
export type PlanType = 'prepaid' | 'postpaid';
export type MessagePriority = 'normal' | 'urgent';
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
  balance?: number;
  limit?: number;
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
  cost: number;
}

/** @deprecated Use MessageResponse */
export type Message = MessageResponse;

export interface SendMessageRequest {
  conversationId: string;
  recipientId?: string;
  content: string;
  priority: MessagePriority;
}

export interface SendMessageResponse {
  id: string;
  status: 'queued';
  timestamp: string;
  estimatedDelivery: string;
  cost: number;
  currentBalance?: number;
}
