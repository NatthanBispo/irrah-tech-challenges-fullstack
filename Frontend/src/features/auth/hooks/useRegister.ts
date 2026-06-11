import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { RegisterPayload } from '../../../shared/types';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/auth.service';

export function useRegister() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (data) => {
      toast.success('Cadastro realizado com sucesso!');
      saveSession(data.token, data.client);
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Não foi possível concluir o cadastro. Tente novamente.');
    },
  });
}
