import type {
  AuthRequest,
  AuthResponse,
  RegisterPayload,
} from '../../../shared/types';
import { api } from '../../../shared/services/api';

export type LoginPayload = AuthRequest;

export async function login(payload: AuthRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}
