import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { CLIENT_KEY, TOKEN_KEY } from '../constants';
import { GuestRoute } from './GuestRoute';
import { renderWithProviders } from '../../test/test-utils';

const mockClient = {
  id: 'client-id',
  name: 'Cliente Teste',
  documentId: '12345678901',
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  active: true,
};

describe('GuestRoute', () => {
  it('renderiza login quando não autenticado', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <div data-testid="login">Login</div>
            </GuestRoute>
          }
        />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    );

    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('redireciona para dashboard quando autenticado', async () => {
    localStorage.setItem(TOKEN_KEY, 'client-id');
    localStorage.setItem(CLIENT_KEY, JSON.stringify(mockClient));

    renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <div data-testid="login">Login</div>
            </GuestRoute>
          }
        />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });
});
