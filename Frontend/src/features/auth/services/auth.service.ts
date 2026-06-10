import type { AuthResponse, DocumentType } from '../../../shared/types';
import { api } from '../../../shared/services/api';

export interface LoginPayload {
  documentId: string;
  documentType: DocumentType;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth', payload);
  return data;
}
