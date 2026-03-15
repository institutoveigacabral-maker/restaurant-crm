# Restaurant CRM

CRM completo para restaurantes com sistema de reservas, gestão financeira, controle de clientes e métricas operacionais. Inclui testes automatizados e E2E.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Drizzle ORM + Neon (PostgreSQL serverless)
- NextAuth.js (autenticação)
- Tailwind CSS + shadcn/ui
- Vitest + Playwright (testes)
- Husky + lint-staged (CI)

## Como rodar

```bash
git clone https://github.com/institutoveigacabral-maker/restaurant-crm.git
cd restaurant-crm
npm install
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do PostgreSQL (Neon) |
| `AUTH_SECRET` | Secret do NextAuth.js |

## Estrutura

```
src/
├── app/           # App Router (páginas e API routes)
├── components/    # Componentes React
├── data/          # Dados estáticos
├── db/            # Schema e conexão Drizzle
├── lib/           # Utilitários
├── middleware.ts   # Middleware Next.js
├── services/      # Camada de serviços
├── types/         # Tipos TypeScript
└── __tests__/     # Testes unitários
```
