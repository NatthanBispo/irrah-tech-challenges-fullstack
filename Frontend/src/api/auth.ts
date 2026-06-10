import type { AuthResponse, DocumentType } from '../types';
import { api } from './client';

export interface LoginPayload {
  documentId: string;
  documentType: DocumentType;
}

export async function login(_payload: LoginPayload): Promise<AuthResponse> {
  // TODO: integrar com POST /auth
  const { data } = await api.post<AuthResponse>('/auth', _payload);
  return data;
}
