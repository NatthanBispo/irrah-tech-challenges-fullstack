import type { SendMessageRequest, SendMessageResponse } from '../types';
import { api } from './client';

export async function sendMessage(
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  // TODO: integrar com POST /messages
  const { data } = await api.post<SendMessageResponse>('/messages', payload);
  return data;
}
