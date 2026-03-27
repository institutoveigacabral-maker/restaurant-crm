# CLAUDE.md — NEXIAL REDE NEURAL

> Regras globais em `~/.claude/CLAUDE.md`. Contexto do workspace em `../CLAUDE.md`.

## O QUE E

Plataforma de inteligencia operacional para negocios (restauracao).
White-label, multi-tenant. Primeiro cliente: Grupo Pateo (3 marcas).
Evolucao do Restaurant CRM para produto SaaS completo.

## NOME DO PRODUTO

**Nexial Rede Neural** — plataforma de consultoria com 7 modulos.

## STACK

- Framework: Next.js 16 + React 19 + TypeScript
- ORM: Drizzle + PostgreSQL (Neon)
- Auth: NextAuth v5 (JWT com tenant context)
- UI: base-ui + Tailwind CSS 4 + Sonner
- Email: Resend
- Charts: Recharts
- Testes: Vitest (unit) + Playwright (E2E)
- Quality: Husky + lint-staged + ESLint + Prettier

## ARQUITETURA

### Multi-tenancy

- Shared database, shared schema com `tenant_id` discriminator
- Hierarquia: tenant pai (grupo) -> tenants filhos (marcas)
- Tenant resolution: subdominio / custom domain / header X-Tenant-Id
- JWT inclui tenantId, tenantSlug, tenantName
- Todos os services recebem `tenantId` como primeiro parametro

### 7 Modulos

1. **Diagnostico** — Anamnese, score maturidade, radar chart
2. **Comando** — SOPs, documentos, onboarding
3. **CRM** — Clientes, reservas, pedidos, cardapio
4. **Clones** — Agentes IA por departamento
5. **Automacoes** — Fluxos WhatsApp, triggers, follow-up
6. **Receitas** — E-commerce, delivery, fidelidade
7. **Dashboard** — KPIs executivos, ROI, metricas

### Schema (39 tabelas)

- Auth: users, accounts, sessions, verificationTokens (global)
- Multi-tenancy: tenants, tenantUsers
- CRM: customers, reservations, orders, menuCategories, menuItems
- Diagnostico: diagnostics, diagnosticTemplates
- Comando: sops, documents, onboardingChecklists, onboardingProgress
- Clones: clones, cloneKnowledgeBase
- Automacoes: automations, automationLogs
- Receitas: loyaltyPrograms, loyaltyBalances, loyaltyTransactions
- Gamificacao: employeeProfiles, courses, courseEnrollments, badges, etc.
- Sistema: restaurantSettings, featureFlags, notifications, webhooks, activityLog

## ESTADO ATUAL

DEV. Multi-tenancy implementada. Modulos Diagnostico, Comando, CRM e Dashboard funcionais.
Clones, Automacoes e Receitas em stub (roadmap mes 2-4).

## COMO RODAR

```bash
pnpm install
cp .env.example .env.local  # preencher DATABASE_URL, AUTH_SECRET
pnpm db:push                # push 39 tabelas
pnpm db:seed                # seed Grupo Pateo + 3 marcas
pnpm dev
```

Login: henrique@nexial.pt / nexial2026

## SCRIPTS

| Comando          | Acao                        |
| ---------------- | --------------------------- |
| `pnpm dev`       | Servidor de desenvolvimento |
| `pnpm test`      | Vitest                      |
| `pnpm test:e2e`  | Playwright                  |
| `pnpm validate`  | Lint + typecheck + testes   |
| `pnpm db:push`   | Push schema                 |
| `pnpm db:seed`   | Seed Grupo Pateo            |
| `pnpm db:studio` | Drizzle Studio              |

## DECISOES ARQUITETURAIS

- Multi-tenancy: shared DB com tenant_id (nao schema-per-tenant)
- ORM: Drizzle (consistente com workspace)
- Hierarquia de tenants com parentId (grupo -> marcas)
- JWT strategy com tenant context embutido
- White-label via cores e logo por tenant

## O QUE NAO MEXER SEM APROVACAO

- Schema Drizzle (src/db/schema.ts) — 39 tabelas, multi-tenant
- Configuracao de auth (src/lib/auth.ts) — JWT com tenant
- Tenant resolution (src/lib/tenant.ts)
- Estrutura de modulos na sidebar
