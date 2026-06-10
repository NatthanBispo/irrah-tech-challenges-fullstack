import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CLIENT_KEY, TOKEN_KEY } from '../../../shared/constants';
import { api } from '../../../shared/services/api';
import type { Client } from '../../../shared/types';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../../../shared/services/api', () => ({
  api: {
    defaults: {
      headers: {
        common: {} as Record<string, string>,
      },
    },
  },
}));

const mockClient: Client = {
  id: 'client-id',
  name: 'Cliente Teste',
  documentId: '12345678901',
  documentType: 'CPF',
  planType: 'prepaid',
  active: true,
};

function AuthConsumer() {
  const { token, client, isAuthenticated, saveSession, logout } = useAuth();

  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="token">{token ?? ''}</span>
      <span data-testid="client-name">{client?.name ?? ''}</span>
      <button type="button" onClick={() => saveSession('new-token', mockClient)}>
        Salvar sessão
      </button>
      <button type="button" onClick={logout}>
        Sair
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('restaura sessão do localStorage', async () => {
    localStorage.setItem(TOKEN_KEY, 'stored-token');
    localStorage.setItem(CLIENT_KEY, JSON.stringify(mockClient));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    expect(screen.getByTestId('client-name')).toHaveTextContent('Cliente Teste');
    expect(api.defaults.headers.common.Authorization).toBe('Bearer stored-token');
  });

  it('salva sessão no localStorage e no header da API', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Salvar sessão' }));

    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');
    expect(JSON.parse(localStorage.getItem(CLIENT_KEY)!)).toEqual(mockClient);
    expect(api.defaults.headers.common.Authorization).toBe('Bearer new-token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('limpa sessão no logout', async () => {
    const user = userEvent.setup();

    localStorage.setItem(TOKEN_KEY, 'stored-token');
    localStorage.setItem(CLIENT_KEY, JSON.stringify(mockClient));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(CLIENT_KEY)).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });
});
