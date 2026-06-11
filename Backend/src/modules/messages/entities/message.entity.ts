export interface MessageEntity {
  id: string;
  conversationId: string;
  content: string;
  sentById: string;
  sentByType: string;
  timestamp: Date;
  priority: string;
  status: string;
  cost: number;
  estimatedDelivery?: Date | null;
}
