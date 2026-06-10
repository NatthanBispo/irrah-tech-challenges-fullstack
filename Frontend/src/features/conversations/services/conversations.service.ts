import type { Conversation, Message } from '../../../shared/types';
import { api } from '../../../shared/services/api';

export async function getConversations(): Promise<Conversation[]> {
  // TODO: listar conversas do cliente autenticado
  const { data } = await api.get<Conversation[]>('/conversations');
  return data;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<Message[]> {
  // TODO: listar mensagens de uma conversa
  const { data } = await api.get<Message[]>(
    `/conversations/${conversationId}/messages`,
  );
  return data;
}
