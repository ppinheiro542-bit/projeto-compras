import { describe, expect, it } from 'vitest';
import { canManage, isAdmin, ROLE_LABELS } from './profiles';

describe('canManage', () => {
  it('permite admin e gestor', () => {
    expect(canManage('admin')).toBe(true);
    expect(canManage('gestor')).toBe(true);
  });

  it('bloqueia usuário comum e valores vazios', () => {
    expect(canManage('usuario')).toBe(false);
    expect(canManage(null)).toBe(false);
    expect(canManage(undefined)).toBe(false);
  });
});

describe('isAdmin', () => {
  it('só é verdadeiro para admin', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('gestor')).toBe(false);
    expect(isAdmin('usuario')).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe('ROLE_LABELS', () => {
  it('tem rótulo em português para todos os papéis', () => {
    expect(ROLE_LABELS.admin).toBe('Administrador');
    expect(ROLE_LABELS.gestor).toBe('Gestor');
    expect(ROLE_LABELS.usuario).toBe('Usuário');
  });
});
