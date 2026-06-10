import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { CLIENT_KEY, TOKEN_KEY } from '../../../shared/constants';
import { renderWithProviders } from '../../../test/test-utils';
import { LoginForm } from './LoginForm';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service');

const mockClient = {
  id: 'client-id',
  name: 'Cliente Teste',
  documentId: '12345678901',
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  active: true,
};

function LoginRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route
        path="/dashboard"
        element={<div data-testid="dashboard">Dashboard</div>}
      />
    </Routes>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica máscara de CPF no campo de documento', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    const input = screen.getByPlaceholderText('000.000.000-00');
    await user.type(input, '12345678901');

    expect(input).toHaveValue('123.456.789-01');
  });

  it('altera máscara ao trocar para CNPJ', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.click(screen.getByLabelText('PJ (CNPJ)'));

    const input = screen.getByPlaceholderText('00.000.000/0000-00');
    await user.type(input, '12345678000199');

    expect(input).toHaveValue('12.345.678/0001-99');
  });

  it('autentica com sucesso, persiste sessão e redireciona', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'client-id',
      client: mockClient,
    });

    const user = userEvent.setup();

    renderWithProviders(<LoginRoutes />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    expect(authService.login).toHaveBeenCalledWith({
      documentId: '12345678901',
      documentType: 'CPF',
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('client-id');
    expect(JSON.parse(localStorage.getItem(CLIENT_KEY)!)).toEqual(mockClient);
  });

  it('exibe erro quando autenticação falha', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('not found'));

    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(screen.getByPlaceholderText('000.000.000-00'), '00000000000');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('Documento não encontrado ou cliente inativo.'),
    ).toBeInTheDocument();
  });
});
