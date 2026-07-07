'use client';

import { useMemo, useState, useTransition } from 'react';
import { Ban, CheckCircle2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { setUserActive, updateUserRole } from '@/lib/actions/users';
import { formatDateTime } from '@/lib/format';
import { ROLE_LABELS, USER_ROLES, type Profile, type UserRole } from '@/lib/types/profiles';

const ALL = '__all__';

function Avatar({ url }: { url: string | null }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

type Props = { users: Profile[]; currentUserId: string };

export function UsersTable({ users, currentUserId }: Props) {
  const [pending, start] = useTransition();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchTerm =
        !term ||
        (u.full_name ?? '').toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchRole = roleFilter === ALL || u.role === roleFilter;
      const matchStatus =
        statusFilter === ALL ||
        (statusFilter === 'ativos' ? u.is_active : !u.is_active);
      return matchTerm && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function handleRole(userId: string, role: UserRole) {
    start(async () => {
      const result = await updateUserRole(userId, role);
      if ('error' in result) toast.error(result.error);
      else toast.success('Papel atualizado.');
    });
  }

  function handleActive(userId: string, isActive: boolean) {
    start(async () => {
      const result = await setUserActive(userId, isActive);
      if ('error' in result) toast.error(result.error);
      else toast.success(isActive ? 'Usuário ativado.' : 'Usuário desativado.');
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os papéis</SelectItem>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="inativos">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar url={u.avatar_url} />
                        <div>
                          <div className="font-medium">
                            {u.full_name ?? '—'}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRole(u.id, v as UserRole)}
                        disabled={pending}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending || isSelf}
                          onClick={() => handleActive(u.id, false)}
                          className="text-muted-foreground hover:text-destructive"
                          title={isSelf ? 'Você não pode desativar a própria conta' : 'Desativar'}
                        >
                          <Ban className="mr-1.5 h-4 w-4" />
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() => handleActive(u.id, true)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Ativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {users.length} usuários
      </p>
    </div>
  );
}
