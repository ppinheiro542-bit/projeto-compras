# Changelog

Histórico de versões do **Projeto Compras**.

## 1.2.0 — Governança e profissionalização
- **Papéis (RBAC):** Administrador, Gestor e Usuário, com permissões e RLS por papel.
- **Gestão de usuários:** tela de administração para papéis e ativação de contas.
- **Auditoria visível:** consulta de todas as alterações com diff antes/depois (versionamento).
- **Notificações e alertas:** sino no cabeçalho, avisos de comentários e estoque baixo.
- **API REST / JSON:** endpoints `/api/products` e exportação em JSON.
- **Relatórios avançados:** gráfico de linha, resumo por categoria, totais e médias.
- **Testes:** unitários (Vitest) e end-to-end (Playwright).
- **UX:** identidade visual, dashboard enriquecido, estados de carregamento.

## 1.1.0 — Funcionalidades do usuário
- Edição de perfil (nome, e-mail, avatar).
- Mural: publicações com imagem, depoimentos/comentários e busca.
- Exportação em PDF e CSV.
- Filtros, ordenação, totais e gráficos (pizza/barra).
- Empacotamento mobile com Capacitor (Android).

## 1.0.0 — Base
- Autenticação (login, cadastro, recuperação de senha, sessão).
- Termos de Uso e consentimento LGPD versionado.
- Catálogo de produtos (CRUD) com auditoria automática por trigger.
