const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INT = new Intl.NumberFormat('pt-BR');

export function formatBRL(value: number | string): string {
  return BRL.format(Number(value));
}

export function formatInt(value: number | string): string {
  return INT.format(Number(value));
}

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(value: string | Date): string {
  return DATE_TIME.format(new Date(value));
}
