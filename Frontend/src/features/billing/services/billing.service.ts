import { api } from '../../../shared/services/api';
import type {
  BalanceResponse,
  ConvertPlanRequest,
  PlanType,
  TransactionResponse,
  UpdateLimitRequest,
} from '../../../shared/types';

export interface TopUpResponse {
  /** Saldo em centavos */
  balance: number;
}

export async function topUpBalance(amountCents: number): Promise<TopUpResponse> {
  const { data } = await api.post<TopUpResponse>('/billing/top-up', {
    amount: amountCents,
  });
  return data;
}

export async function getBalance(): Promise<BalanceResponse> {
  const { data } = await api.get<BalanceResponse>('/billing/balance');
  return data;
}

export async function updateLimit(payload: UpdateLimitRequest): Promise<{ limit: number }> {
  const { data } = await api.patch<{ limit: number }>('/billing/limit', payload);
  return data;
}

export async function convertPlan(payload: ConvertPlanRequest): Promise<BalanceResponse> {
  const { data } = await api.post<BalanceResponse>('/billing/plan-conversion', payload);
  return data;
}

export async function getTransactions(filters?: {
  type?: string;
  from?: string;
  to?: string;
}): Promise<TransactionResponse[]> {
  const { data } = await api.get<TransactionResponse[]>('/transactions', {
    params: filters,
  });
  return data;
}

// re-export for convenience
export type { PlanType };

