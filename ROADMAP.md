# RestaurantCRM — Roadmap de Produção

## Visão Geral

Roadmap para transformar o MVP atual em um CRM profissional para restaurantes,
organizado em 6 fases incrementais. Cada fase entrega valor real e pode ir para produção.

---

## Fase 1 — Fundação & Segurança (Sprint 1-2)

> Tornar o sistema seguro e robusto antes de qualquer feature nova.

### 1.1 Autenticação & Autorização

- [ ] NextAuth.js com providers (Google, Email/Senha)
- [ ] Middleware de proteção de rotas (`middleware.ts`)
- [ ] Roles: `admin`, `gerente`, `garçom`
- [ ] Permissões por role (RBAC)
- [ ] Página de login/registro

### 1.2 Validação & Segurança

- [ ] Zod para validação de inputs (API + formulários)
- [ ] Sanitização de dados em todas as rotas
- [ ] Rate limiting nas API routes
- [ ] Headers de segurança (CSP, HSTS, etc.)
- [ ] Variáveis de ambiente tipadas com `@t3-oss/env-nextjs`

### 1.3 Tratamento de Erros

- [ ] Error boundaries no React
- [ ] Respostas de erro padronizadas na API (formato consistente)
- [ ] Toast notifications (sonner) para feedback ao usuário
- [ ] Loading skeletons em todas as páginas
- [ ] Fallback states para erros de rede

### 1.4 Banco de Dados

- [ ] Drizzle ORM para type-safety e migrations
- [ ] Schema migrations versionadas
- [ ] Índices nas colunas de busca (email, phone, date, status)
- [ ] Soft delete em todas as tabelas (`deleted_at`)
- [ ] Audit log (tabela `activity_log`: quem, o quê, quando)

---

## Fase 2 — Qualidade de Código & DX (Sprint 3)

> Garantir que o código é testável, consistente e documentável.

### 2.1 Arquitetura

- [ ] Service layer (`src/services/`) — lógica de negócio separada das routes
- [ ] Repository pattern (`src/repositories/`) — queries isoladas
- [ ] Middleware reutilizável para auth, validação, logging
- [ ] API response helpers (success/error com tipos)

### 2.2 Testes

- [ ] Vitest para unit tests
- [ ] Testing Library para testes de componentes
- [ ] Playwright para E2E tests
- [ ] Coverage mínima: 80%
- [ ] Testes de API routes com mocks do banco

### 2.3 CI/CD

- [ ] GitHub Actions: lint → typecheck → test → build
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Deploy automático na Vercel (preview por PR, prod no main)
- [ ] Branch protection rules

### 2.4 Ferramentas de DX

- [ ] ESLint + Prettier configurados
- [ ] Path aliases consistentes
- [ ] Scripts npm padronizados (`dev`, `build`, `test`, `db:migrate`, `db:seed`)
- [ ] `.env.example` documentado

---

## Fase 3 — UX Profissional & Features Core (Sprint 4-5)

> Elevar a interface e completar funcionalidades essenciais de CRM.

### 3.1 Design System

- [ ] shadcn/ui como biblioteca de componentes
- [ ] Tema customizado (cores do restaurante configuráveis)
- [ ] Dark mode
- [ ] Componentes reutilizáveis: DataTable, Modal, Form, Badge, Card
- [ ] Responsivo completo (mobile-first)

### 3.2 Clientes (Aprimorado)

- [ ] Página de perfil individual do cliente
- [ ] Histórico completo de visitas, pedidos e reservas
- [ ] Sistema de fidelidade (pontos por visita/gasto)
- [ ] Segmentação avançada (filtros combinados)
- [ ] Importação/exportação CSV
- [ ] Paginação server-side com busca
- [ ] Ordenação por qualquer coluna

### 3.3 Reservas (Aprimorado)

- [ ] Visualização de calendário (semanal/mensal)
- [ ] Mapa de mesas visual (drag-and-drop)
- [ ] Conflito de horários (validação automática)
- [ ] Confirmação automática por email/WhatsApp
- [ ] Waitlist (lista de espera)
- [ ] Recorrência (reservas fixas semanais)

### 3.4 Pedidos (Aprimorado)

- [ ] Cardápio digital integrado (CRUD de pratos)
- [ ] Categorias de pratos
- [ ] Criação de pedido com seleção do cardápio
- [ ] Comanda digital por mesa
- [ ] Divisão de conta
- [ ] Impressão de comanda

### 3.5 Gestão de Mesas

- [ ] Cadastro de mesas com capacidade e localização
- [ ] Status em tempo real (livre, ocupada, reservada)
- [ ] Layout visual do salão (grid configurável)
- [ ] Junção/separação de mesas

---

## Fase 4 — Inteligência & Analytics (Sprint 6-7)

> Dados que geram decisões.

### 4.1 Dashboard Avançado

- [ ] Gráficos interativos (Recharts): receita, ocupação, ticket médio
- [ ] Filtro por período (hoje, semana, mês, custom)
- [ ] Comparativo com período anterior
- [ ] KPIs em tempo real com atualização automática

### 4.2 Relatórios

- [ ] Relatório de vendas por período
- [ ] Relatório de pratos mais vendidos
- [ ] Relatório de clientes mais frequentes
- [ ] Relatório de ocupação por horário/dia
- [ ] Exportação PDF e Excel
- [ ] Agendamento de relatórios por email

### 4.3 Insights Automáticos

- [ ] Clientes em risco de churn (não visitam há X dias)
- [ ] Sugestão de promoções baseada em histórico
- [ ] Previsão de demanda por dia/horário
- [ ] Alertas automáticos (estoque baixo, mesa ociosa, etc.)

---

## Fase 5 — Integrações & Comunicação (Sprint 8-9)

> Conectar o CRM ao ecossistema do restaurante.

### 5.1 Comunicação com Cliente

- [ ] Envio de email transacional (reserva confirmada, lembrete)
- [ ] Integração WhatsApp Business API
- [ ] Campanhas de email marketing (aniversários, promoções)
- [ ] Notificações push (PWA)

### 5.2 Pagamentos

- [ ] Integração Stripe/Mercado Pago
- [ ] Pagamento na comanda digital
- [ ] Gorjeta digital
- [ ] Histórico de pagamentos no perfil do cliente

### 5.3 Integrações Externas

- [ ] iFood / Rappi (importação de pedidos)
- [ ] Google My Business (reviews)
- [ ] Calendário Google (sync de reservas)
- [ ] Webhook system para integrações custom

### 5.4 PWA & Mobile

- [ ] Progressive Web App completa
- [ ] Funcionamento offline (Service Worker)
- [ ] Notificações push nativas
- [ ] App instalável no celular

---

## Fase 6 — Escala & Operações (Sprint 10-11)

> Preparar para múltiplos restaurantes e alta disponibilidade.

### 6.1 Multi-tenancy

- [ ] Suporte a múltiplos restaurantes
- [ ] Painel admin por restaurante
- [ ] Configurações independentes por unidade
- [ ] Dashboard consolidado (visão grupo)

### 6.2 Observabilidade

- [ ] Sentry para error tracking
- [ ] Logging estruturado (Pino)
- [ ] Métricas de performance (Web Vitals)
- [ ] Health check endpoint
- [ ] Uptime monitoring

### 6.3 Performance

- [ ] Cache com Redis (Upstash)
- [ ] Otimização de queries (EXPLAIN ANALYZE)
- [ ] ISR/SSR estratégico por página
- [ ] Image optimization (Next.js Image)
- [ ] Bundle analysis e code splitting

### 6.4 Infraestrutura

- [ ] Backup automático do banco (Neon snapshots)
- [ ] Ambiente de staging
- [ ] Feature flags (Vercel Edge Config)
- [ ] CDN para assets estáticos
- [ ] Documentação API (OpenAPI/Swagger)

---

## Stack Final Alvo

| Camada        | Tecnologia                            |
| ------------- | ------------------------------------- |
| Framework     | Next.js 16 (App Router)               |
| UI            | React 19 + shadcn/ui + Tailwind 4     |
| Linguagem     | TypeScript 5 (strict)                 |
| Banco         | Neon PostgreSQL + Drizzle ORM         |
| Auth          | NextAuth.js v5                        |
| Validação     | Zod                                   |
| Testes        | Vitest + Testing Library + Playwright |
| CI/CD         | GitHub Actions + Vercel               |
| Monitoramento | Sentry + Pino                         |
| Cache         | Upstash Redis                         |
| Email         | Resend                                |
| Pagamentos    | Stripe                                |
| Charts        | Recharts                              |
| Icons         | Lucide React                          |

---

## Prioridade de Execução

```
Fase 1 (Segurança)     ████████████░░░░░░░░  Crítico — sem isso, não vai pra prod
Fase 2 (Qualidade)     ████████░░░░░░░░░░░░  Alto — garante sustentabilidade
Fase 3 (Features)      ████████████████░░░░  Alto — valor direto pro usuário
Fase 4 (Analytics)     ██████████░░░░░░░░░░  Médio — diferencial competitivo
Fase 5 (Integrações)   ████████░░░░░░░░░░░░  Médio — expande o ecossistema
Fase 6 (Escala)        ██████░░░░░░░░░░░░░░  Baixo — quando a demanda pedir
```

---

## Convenções do Projeto

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branches**: `main` (prod), `develop` (staging), `feat/*`, `fix/*`
- **PRs**: Sempre com review, nunca push direto no main
- **Code style**: ESLint + Prettier, sem warnings permitidos
- **Naming**: camelCase (TS), snake_case (banco), kebab-case (arquivos)
- **Componentes**: Um por arquivo, named exports
- **API**: RESTful, verbos HTTP corretos, status codes corretos
