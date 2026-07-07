import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brand } from '@/components/layout/brand';
import { APP_VERSION } from '@/lib/version';

export const metadata = { title: 'Sobre · Projeto Compras' };

const CHANGELOG: { version: string; title: string; items: string[] }[] = [
  {
    version: '1.2.0',
    title: 'Governança e profissionalização',
    items: [
      'Papéis (Administrador/Gestor/Usuário) com permissões e RLS',
      'Gestão de usuários e auditoria com histórico de alterações',
      'Notificações, API REST/JSON e relatórios avançados',
      'Testes automatizados e nova identidade visual',
    ],
  },
  {
    version: '1.1.0',
    title: 'Funcionalidades do usuário',
    items: [
      'Perfil, Mural (publicações e depoimentos), busca',
      'Exportação PDF/CSV, filtros, gráficos',
      'Empacotamento mobile (Capacitor)',
    ],
  },
  {
    version: '1.0.0',
    title: 'Base',
    items: [
      'Autenticação e sessão',
      'Termos e consentimento LGPD',
      'Catálogo de produtos com auditoria',
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="items-center text-center">
          <Brand showTagline className="scale-125" />
          <Badge variant="secondary" className="mt-3 font-mono">
            {APP_VERSION}
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Sistema de gestão de compras desenvolvido como trabalho acadêmico, com autenticação,
          governança por papéis, conformidade LGPD, auditoria e relatórios.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Histórico de versões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {CHANGELOG.map((v) => (
            <div key={v.version}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{v.version}</span>
                <span className="text-sm text-muted-foreground">— {v.title}</span>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {v.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
