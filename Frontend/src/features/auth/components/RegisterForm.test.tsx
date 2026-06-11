import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { TOKEN_KEY } from '../../../shared/constants';
import { renderWithProviders } from '../../../test/test-utils';
import { RegisterForm } from './RegisterForm';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service');

const VALID_CPF = '39053344705';
const VALID_CNPJ = '11222333000181';
const PASSWORD = 'Senha1234';

const mockPrepaidClient = {
  id: 'client-id',
  name: 'Empresa Teste',
  documentId: VALID_CPF,
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  balance: 0,
  active: true,
};

const mockPostpaidClient = {
  id: 'client-id-2',
  name: 'Tech Solutions',
  documentId: VALID_CNPJ,
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

async function fillRegisterForm(
  user: ReturnType<typeof userEvent.setup>,
  options: {
    name: string;
    document: string;
    password?: string;
    confirmPassword?: string;
    documentPlaceholder?: string;
  },
) {
  await user.type(
    screen.getByPlaceholderText('Nome da empresa ou pessoa'),
    options.name,
  );
  await user.type(
    screen.getByPlaceholderText(options.documentPlaceholder ?? '000.000.000-00'),
    options.document,
  );
  await user.type(
    screen.getByPlaceholderText('Crie uma senha'),
    options.password ?? PASSWORD,
  );
  await user.type(
    screen.getByPlaceholderText('Repita a senha'),
    options.confirmPassword ?? options.password ?? PASSWORD,
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
    await user.type(input, VALID_CPF);

    expect(input).toHaveValue('390.533.447-05');
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

    await fillRegisterForm(user, {
      name: 'Empresa Teste',
      document: VALID_CPF,
    });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Empresa Teste',
      documentId: VALID_CPF,
      documentType: 'CPF',
      planType: 'prepaid',
      password: PASSWORD,
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

    await user.click(screen.getByRole('radio', { name: /PJ \(CNPJ\)/ }));
    await fillRegisterForm(user, {
      name: 'Tech Solutions',
      document: VALID_CNPJ,
      documentPlaceholder: '00.000.000/0000-00',
    });
    await user.click(screen.getByRole('radio', { name: /Pós-pago/ }));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Tech Solutions',
        documentId: VALID_CNPJ,
        documentType: 'CNPJ',
        planType: 'postpaid',
        password: PASSWORD,
      });
    });
  });

  it('exibe erro para CPF inválido antes de enviar', async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillRegisterForm(user, {
      name: 'Empresa Teste',
      document: '12345678901',
    });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('Informe um CPF válido.'),
    ).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('exibe erro quando senhas não coincidem', async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillRegisterForm(user, {
      name: 'Empresa Teste',
      document: VALID_CPF,
      password: PASSWORD,
      confirmPassword: 'OutraSenha',
    });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('exibe erro quando senha é curta', async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillRegisterForm(user, {
      name: 'Empresa Teste',
      document: VALID_CPF,
      password: 'curta',
      confirmPassword: 'curta',
    });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('A senha deve ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('exibe erro quando documento já está cadastrado', async () => {
    vi.mocked(authService.register).mockRejectedValue({
      response: { status: 409 },
    });

    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillRegisterForm(user, {
      name: 'Empresa Teste',
      document: VALID_CPF,
    });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('Este documento já está cadastrado.'),
    ).toBeInTheDocument();
  });
});
