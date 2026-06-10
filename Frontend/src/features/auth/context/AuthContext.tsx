import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CLIENT_KEY, TOKEN_KEY } from '../../../shared/constants';
import { api } from '../../../shared/services/api';
import type { Client } from '../../../shared/types';

interface AuthContextValue {
  token: string | null;
  client: Client | null;
  isAuthenticated: boolean;
  saveSession: (token: string, client: Client) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredSession(): { token: string | null; client: Client | null } {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedClient = localStorage.getItem(CLIENT_KEY);

  if (storedToken && storedClient) {
    return {
      token: storedToken,
      client: JSON.parse(storedClient) as Client,
    };
  }

  return { token: null, client: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => getStoredSession().token,
  );
  const [client, setClient] = useState<Client | null>(
    () => getStoredSession().client,
  );

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      client,
      isAuthenticated: Boolean(token),
      saveSession: (nextToken, nextClient) => {
        setToken(nextToken);
        setClient(nextClient);
        api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
        localStorage.setItem(TOKEN_KEY, nextToken);
        localStorage.setItem(CLIENT_KEY, JSON.stringify(nextClient));
      },
      logout: () => {
        setToken(null);
        setClient(null);
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CLIENT_KEY);
      },
    }),
    [token, client],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
