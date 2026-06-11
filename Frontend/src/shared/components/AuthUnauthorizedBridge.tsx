import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUnauthorizedHandler } from '../../middleware';
import { useAuth } from '../../features/auth/context/AuthContext';

export function AuthUnauthorizedBridge() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
    });
  }, [logout, navigate]);

  return null;
}
