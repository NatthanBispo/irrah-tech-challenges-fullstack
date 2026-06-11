import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import { updateLimit } from '../services/billing.service';

export function useUpdateLimit() {
  const { client, updateClient } = useAuth();

  return useMutation({
    mutationFn: (limitCents: number) => updateLimit({ limit: limitCents }),
    onSuccess: (data) => {
      toast.success('Limite atualizado com sucesso!');
      if (client) {
        updateClient({ ...client, limit: data.limit });
      }
    },
    onError: () => {
      toast.error('Não foi possível ajustar o limite. Tente novamente.');
    },
  });
}
