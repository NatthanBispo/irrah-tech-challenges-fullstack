import type {
  AuthResponse,
  DocumentType,
  RegisterPayload,
} from '../../../shared/types';
import { api } from '../../../shared/services/api';

export interface LoginPayload {
  documentId: string;
  documentType: DocumentType;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}
