import type { SendMessageRequest, SendMessageResponse } from '../../../shared/types';
import { api } from '../../../shared/services/api';

export async function sendMessage(
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>('/messages', payload);
  return data;
}
