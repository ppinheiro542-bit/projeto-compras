import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renderiza o rótulo "Ativo" para status ativo', () => {
    render(<StatusBadge status="ativo" />);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('renderiza o rótulo "Descontinuado" para status descontinuado', () => {
    render(<StatusBadge status="descontinuado" />);
    expect(screen.getByText('Descontinuado')).toBeInTheDocument();
  });
});
