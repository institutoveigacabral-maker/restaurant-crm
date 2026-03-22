# CLAUDE.md — RESTAURANT CRM

> Regras globais em `~/.claude/CLAUDE.md`. Contexto do workspace em `../CLAUDE.md`.

## O QUE E

CRM para restaurantes. Scaffold avancado com infra de qualidade pronta.

## STACK

- Framework: Next.js 16 + React 19 + TypeScript
- ORM: Drizzle + PostgreSQL (Neon)
- Auth: NextAuth v5
- UI: base-ui + Tailwind CSS + Sonner
- Email: Resend
- Charts: Recharts
- Testes: Vitest (unit) + Playwright (E2E)
- Quality: Husky + lint-staged + ESLint + Prettier

## ESTADO ATUAL

Scaffold. Infra de qualidade completa (testes, linting, formatting, git hooks).
Sem features de negocio implementadas.

## DECISOES ARQUITETURAIS

- ORM: Drizzle (consistente com cortex-fc)
- Testes E2E: Playwright (nao Cypress)
- Git hooks: Husky + lint-staged

## COMO RODAR

```bash
pnpm install
cp .env.example .env.local  # preencher
pnpm db:push                # schema Drizzle
pnpm dev
```

## SCRIPTS

| Comando              | Acao                        |
| -------------------- | --------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento |
| `pnpm test`          | Vitest                      |
| `pnpm test:e2e`      | Playwright                  |
| `pnpm test:coverage` | Cobertura                   |
| `pnpm validate`      | Lint + typecheck + testes   |
| `pnpm db:push`       | Push schema                 |
| `pnpm db:studio`     | Drizzle Studio              |

## O QUE NAO MEXER SEM APROVACAO

- Schema Drizzle (src/db/schema.ts)
- Configuracao de auth
