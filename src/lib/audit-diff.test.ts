import { describe, expect, it } from 'vitest';
import { diffFields, renderAuditValue } from './audit-diff';

describe('diffFields', () => {
  it('detecta apenas os campos que mudaram em um UPDATE', () => {
    const changes = diffFields({
      old_data: { name: 'A', price: 10, stock_qty: 5 },
      new_data: { name: 'A', price: 12, stock_qty: 5 },
    });
    expect(changes).toEqual([{ field: 'price', before: 10, after: 12 }]);
  });

  it('mostra todos os campos como novos em um INSERT (old_data null)', () => {
    const changes = diffFields({ old_data: null, new_data: { name: 'X', price: 9 } });
    expect(changes.map((c) => c.field).sort()).toEqual(['name', 'price']);
    expect(changes.every((c) => c.before === undefined)).toBe(true);
  });

  it('mostra os campos removidos em um DELETE (new_data null)', () => {
    const changes = diffFields({ old_data: { name: 'X' }, new_data: null });
    expect(changes).toEqual([{ field: 'name', before: 'X', after: undefined }]);
  });

  it('retorna vazio quando nada mudou', () => {
    expect(diffFields({ old_data: { a: 1 }, new_data: { a: 1 } })).toEqual([]);
  });
});

describe('renderAuditValue', () => {
  it('formata nulo/indefinido como travessão', () => {
    expect(renderAuditValue(null)).toBe('—');
    expect(renderAuditValue(undefined)).toBe('—');
  });

  it('serializa objetos e converte primitivos', () => {
    expect(renderAuditValue({ a: 1 })).toBe('{"a":1}');
    expect(renderAuditValue(42)).toBe('42');
    expect(renderAuditValue('oi')).toBe('oi');
  });
});
