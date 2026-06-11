import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PlanType } from '../../../shared/types';
import { useAuth } from '../../auth/context/AuthContext';
import { convertPlan } from '../services/billing.service';

export function useConvertPlan() {
  const { client, updateClient } = useAuth();

  return useMutation({
    mutationFn: (planType: PlanType) => convertPlan({ planType }),
    onSuccess: (data) => {
      toast.success('Plano convertido com sucesso!');
      if (client) {
        updateClient({
          ...client,
          planType: data.planType,
          balance: data.balance,
          limit: data.limit,
          monthlyUsage: data.monthlyUsage,
        });
      }
    },
    onError: () => {
      toast.error('Não foi possível converter o plano. Tente novamente.');
    },
  });
}
