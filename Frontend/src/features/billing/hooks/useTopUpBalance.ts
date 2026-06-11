import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import { topUpBalance } from '../services/billing.service';

export function useTopUpBalance() {
  const { client, updateClient } = useAuth();

  return useMutation({
    mutationFn: topUpBalance,
    onSuccess: (data) => {
      toast.success('Saldo recarregado com sucesso!');
      if (client) {
        updateClient({ ...client, balance: data.balance });
      }
    },
    onError: () => {
      toast.error('Não foi possível adicionar saldo. Tente novamente.');
    },
  });
}
