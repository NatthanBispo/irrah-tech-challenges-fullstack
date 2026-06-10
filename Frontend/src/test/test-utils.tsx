import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';

interface ProvidersProps {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
}

function Providers({ children, routerProps }: ProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { routerProps?: MemoryRouterProps },
) {
  const { routerProps, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => (
      <Providers routerProps={routerProps}>{children}</Providers>
    ),
    ...renderOptions,
  });
}
