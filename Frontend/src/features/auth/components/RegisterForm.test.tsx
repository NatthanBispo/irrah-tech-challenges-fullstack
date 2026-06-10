import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { TOKEN_KEY } from '../../../shared/constants';
import { renderWithProviders } from '../../../test/test-utils';
import { RegisterForm } from './RegisterForm';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service');

const mockPrepaidClient = {
  id: 'client-id',
  name: 'Empresa Teste',
  documentId: '12345678901',
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  balance: 0,
  active: true,
};

const mockPostpaidClient = {
  id: 'client-id-2',
  name: 'Tech Solutions',
  documentId: '12345678000199',
  documentType: 'CNPJ' as const,
  planType: 'postpaid' as const,
  limit: 100,
  active: true,
};

function RegisterRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={<div data-testid="dashboard">Dashboard</div>}
      />
    </Routes>
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica máscara de CPF no campo de documento', async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(screen.getByPlaceholderText('Nome da empresa ou pessoa'), 'Empresa');
    const input = screen.getByPlaceholderText('000.000.000-00');
    await user.type(input, '12345678901');

    expect(input).toHaveValue('123.456.789-01');
  });

  it('cadastra cliente pré-pago com sucesso e redireciona', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      token: 'client-id',
      client: mockPrepaidClient,
    });

    const user = userEvent.setup();

    renderWithProviders(<RegisterRoutes />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(
      screen.getByPlaceholderText('Nome da empresa ou pessoa'),
      'Empresa Teste',
    );
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Empresa Teste',
      documentId: '12345678901',
      documentType: 'CPF',
      planType: 'prepaid',
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('client-id');
  });

  it('cadastra cliente pós-pago com plano selecionado', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      token: 'client-id-2',
      client: mockPostpaidClient,
    });

    const user = userEvent.setup();

    renderWithProviders(<RegisterRoutes />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(
      screen.getByPlaceholderText('Nome da empresa ou pessoa'),
      'Tech Solutions',
    );
    await user.click(screen.getByRole('radio', { name: /PJ \(CNPJ\)/ }));
    await user.type(
      screen.getByPlaceholderText('00.000.000/0000-00'),
      '12345678000199',
    );
    await user.click(screen.getByRole('radio', { name: /Pós-pago/ }));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Tech Solutions',
        documentId: '12345678000199',
        documentType: 'CNPJ',
        planType: 'postpaid',
      });
    });
  });

  it('exibe erro quando documento já está cadastrado', async () => {
    vi.mocked(authService.register).mockRejectedValue({
      response: { status: 409 },
    });

    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(
      screen.getByPlaceholderText('Nome da empresa ou pessoa'),
      'Empresa Teste',
    );
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('Este documento já está cadastrado.'),
    ).toBeInTheDocument();
  });
});
