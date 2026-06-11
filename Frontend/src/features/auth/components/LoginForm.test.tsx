import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { CLIENT_KEY, TOKEN_KEY } from '../../../shared/constants';
import { renderWithProviders } from '../../../test/test-utils';
import { LoginForm } from './LoginForm';
import * as authService from '../services/auth.service';

vi.mock('../services/auth.service');

const VALID_CPF = '39053344705';
const VALID_CNPJ = '11222333000181';
const PASSWORD = 'Senha1234';

const mockClient = {
  id: 'client-id',
  name: 'Cliente Teste',
  documentId: VALID_CPF,
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

async function fillLoginForm(
  user: ReturnType<typeof userEvent.setup>,
  document: string,
  password = PASSWORD,
) {
  await user.type(screen.getByPlaceholderText('000.000.000-00'), document);
  await user.type(screen.getByPlaceholderText('Digite sua senha'), password);
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
    await user.type(input, VALID_CPF);

    expect(input).toHaveValue('390.533.447-05');
  });

  it('aplica máscara de CNPJ automaticamente ao digitar 14 dígitos', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    const input = screen.getByPlaceholderText('000.000.000-00');
    await user.type(input, VALID_CNPJ);

    expect(input).toHaveValue('11.222.333/0001-81');
  });

  it('autentica CPF com sucesso e redireciona', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'client-id',
      client: mockClient,
    });

    const user = userEvent.setup();

    renderWithProviders(<LoginRoutes />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillLoginForm(user, VALID_CPF);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    expect(authService.login).toHaveBeenCalledWith({
      documentId: VALID_CPF,
      documentType: 'CPF',
      password: PASSWORD,
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('client-id');
    expect(JSON.parse(localStorage.getItem(CLIENT_KEY)!)).toEqual(mockClient);
  });

  it('autentica CNPJ com sucesso detectando tipo automaticamente', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'client-id-2',
      client: {
        ...mockClient,
        id: 'client-id-2',
        documentId: VALID_CNPJ,
        documentType: 'CNPJ',
      },
    });

    const user = userEvent.setup();

    renderWithProviders(<LoginRoutes />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillLoginForm(user, VALID_CNPJ);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        documentId: VALID_CNPJ,
        documentType: 'CNPJ',
        password: PASSWORD,
      });
    });
  });

  it('exibe erro para documento com quantidade inválida de dígitos', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillLoginForm(user, '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText(
        'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).',
      ),
    ).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('exibe erro para CPF com dígitos verificadores inválidos', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillLoginForm(user, '12345678901');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('Informe um CPF válido.'),
    ).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('exibe erro quando senha não é informada', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await user.type(screen.getByPlaceholderText('000.000.000-00'), VALID_CPF);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('Informe sua senha.'),
    ).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('exibe erro quando autenticação falha', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('not found'));

    const user = userEvent.setup();

    renderWithProviders(<LoginForm />, {
      routerProps: { initialEntries: ['/'] },
    });

    await fillLoginForm(user, '52998224725');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('Documento ou senha incorretos.'),
    ).toBeInTheDocument();
  });
});
