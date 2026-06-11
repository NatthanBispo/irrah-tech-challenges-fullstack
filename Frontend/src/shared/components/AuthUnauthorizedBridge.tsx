import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerUnauthorizedHandler } from '../../middleware';
import { useAuth } from '../../features/auth/context/AuthContext';

export function AuthUnauthorizedBridge() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      toast.error(t('auth.sessionExpired'));
      logout();
      navigate('/login', { replace: true });
    });
  }, [logout, navigate, t]);

  return null;
}
