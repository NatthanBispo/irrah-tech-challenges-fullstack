import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { MessageStatusBadge } from './MessageStatusBadge';

describe('MessageStatusBadge', () => {
  it('renderiza status na fila', () => {
    renderWithProviders(
      <MessageStatusBadge status="queued" label="Na fila" />,
    );

    expect(screen.getByText('Na fila')).toBeInTheDocument();
  });

  it('renderiza status processando', () => {
    renderWithProviders(
      <MessageStatusBadge status="processing" label="Processando" />,
    );

    expect(screen.getByText('Processando')).toBeInTheDocument();
  });

  it('renderiza status enviada', () => {
    renderWithProviders(
      <MessageStatusBadge status="sent" label="Enviada" />,
    );

    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renderiza status entregue', () => {
    renderWithProviders(
      <MessageStatusBadge status="delivered" label="Entregue" />,
    );

    expect(screen.getByText('Entregue')).toBeInTheDocument();
  });

  it('renderiza status lida', () => {
    renderWithProviders(
      <MessageStatusBadge status="read" label="Lida" />,
    );

    expect(screen.getByText('Lida')).toBeInTheDocument();
  });

  it('renderiza status falhou', () => {
    renderWithProviders(
      <MessageStatusBadge status="failed" label="Falhou" />,
    );

    expect(screen.getByText('Falhou')).toBeInTheDocument();
  });
});
