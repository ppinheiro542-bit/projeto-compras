export const USER_ROLES = ['admin', 'gestor', 'usuario'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  usuario: 'Usuário',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total: usuários, auditoria e configurações.',
  gestor: 'Gerencia produtos e relatórios.',
  usuario: 'Consulta dados, mural e edita o próprio perfil.',
};

/** Papéis que podem gerenciar dados operacionais (criar/editar/excluir produtos). */
export function canManage(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'gestor';
}

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === 'admin';
}
