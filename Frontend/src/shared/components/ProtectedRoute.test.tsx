import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { CLIENT_KEY, TOKEN_KEY } from '../constants';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithProviders } from '../../test/test-utils';

const mockClient = {
  id: 'client-id',
  name: 'Cliente Teste',
  documentId: '12345678901',
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  active: true,
};

describe('ProtectedRoute', () => {
  it('redireciona para login quando não autenticado', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div data-testid="private">Área privada</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login">Login</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/dashboard'] } },
    );

    expect(await screen.findByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('private')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo quando autenticado', async () => {
    localStorage.setItem(TOKEN_KEY, 'client-id');
    localStorage.setItem(CLIENT_KEY, JSON.stringify(mockClient));

    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div data-testid="private">Área privada</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login">Login</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/dashboard'] } },
    );

    await waitFor(() => {
      expect(screen.getByTestId('private')).toBeInTheDocument();
    });
  });
});
