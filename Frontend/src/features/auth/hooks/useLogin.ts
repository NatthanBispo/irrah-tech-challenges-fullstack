import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, type LoginPayload } from '../services/auth.service';

export function useLogin() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      saveSession(data.token, data.client);
      navigate('/dashboard');
    },
  });
}
