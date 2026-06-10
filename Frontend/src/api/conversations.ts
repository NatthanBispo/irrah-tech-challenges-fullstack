import type { Conversation, Message } from '../types';
import { api } from './client';

export async function getConversations(): Promise<Conversation[]> {
  // TODO: integrar com GET /conversations
  const { data } = await api.get<Conversation[]>('/conversations');
  return data;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<Message[]> {
  // TODO: integrar com GET /conversations/:id/messages
  const { data } = await api.get<Message[]>(
    `/conversations/${conversationId}/messages`,
  );
  return data;
}
