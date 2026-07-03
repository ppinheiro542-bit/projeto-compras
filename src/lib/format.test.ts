import { describe, expect, it } from 'vitest';
import { formatBRL, formatInt } from './format';

// O Intl usa espaço não separável (U+00A0) entre "R$" e o valor em algumas
// versões do ICU; normalizamos para espaço comum para o teste não ficar frágil.
const norm = (s: string) => s.replace(/ /g, ' ');

describe('formatBRL', () => {
  it('formata número como moeda brasileira', () => {
    expect(norm(formatBRL(1234.5))).toBe('R$ 1.234,50');
  });

  it('aceita string numérica', () => {
    expect(norm(formatBRL('99.9'))).toBe('R$ 99,90');
  });

  it('formata zero corretamente', () => {
    expect(norm(formatBRL(0))).toBe('R$ 0,00');
  });
});

describe('formatInt', () => {
  it('formata inteiros com separador de milhar', () => {
    expect(formatInt(1500000)).toBe('1.500.000');
  });

  it('formata zero', () => {
    expect(formatInt(0)).toBe('0');
  });
});
