import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/context/AuthContext';
import { getTransactions } from '../services/billing.service';

export function useTransactions() {
  const { client } = useAuth();

  return useQuery({
    queryKey: ['transactions', client?.id],
    queryFn: () => getTransactions(),
    enabled: !!client,
  });
}
