import type { ConversationResponse, MessageResponse } from '../../../shared/types';
import { api } from '../../../shared/services/api';

export async function getConversations(): Promise<ConversationResponse[]> {
  const { data } = await api.get<ConversationResponse[]>('/conversations');
  return data;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<MessageResponse[]> {
  const { data } = await api.get<MessageResponse[]>(
    `/conversations/${conversationId}/messages`,
  );
  return data;
}
