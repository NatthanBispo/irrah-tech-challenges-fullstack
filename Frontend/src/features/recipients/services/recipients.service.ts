import type { Recipient } from '../../../shared/types';
import { api } from '../../../shared/services/api';

export async function getRecipients(): Promise<Recipient[]> {
  const { data } = await api.get<Recipient[]>('/recipients');
  return data;
}
