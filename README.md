# Restaurant CRM

CRM completo para restaurantes com gamificacao, treinamento de equipe e analytics operacional.

![CI](https://github.com/institutoveigacabral-maker/restaurant-crm/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Sobre o Projeto

Sistema de gestao para restaurantes que vai alem do CRM tradicional. Combina controle de clientes, pedidos e reservas com um modulo de gamificacao para engajamento da equipe, plataforma de treinamento com cursos e certificacoes, e dashboards analiticos em tempo real.

**Producao:** [deploy-restaurant-crm.vercel.app](https://deploy-restaurant-crm.vercel.app)

---

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript |
| Banco de Dados | PostgreSQL serverless (Neon) |
| ORM | Drizzle ORM |
| Autenticacao | NextAuth.js v5 |
| UI | Tailwind CSS 4 + shadcn/ui + Lucide Icons |
| Graficos | Recharts |
| E-mail | Resend |
| Monitoramento | Sentry (client, server, edge) + Web Vitals |
| Validacao | Zod 4 |
| Testes | Vitest + Testing Library + Playwright (E2E) |
| CI/QA | Husky + lint-staged + ESLint + Prettier |
| Deploy | Vercel + Neon |

---

## Funcionalidades

### CRM e Operacoes
- Cadastro e gestao de clientes com tags, historico de visitas e gasto total
- Sistema de reservas com controle de mesas, horarios e status
- Gestao de pedidos com itens (JSONB) e acompanhamento de status
- Cardapio digital com categorias, precos e disponibilidade
- Configuracoes do restaurante (horarios, moeda, timezone, politica de reservas)
- Feature flags para controle de funcionalidades

### Gamificacao
- Perfil de funcionario com XP, nivel e streak de atividade
- Sistema de badges com raridade (common, rare, epic, legendary)
- Desafios temporais com metas e recompensas de XP
- Leaderboard competitivo entre a equipe
- Transacoes de XP rastreadas por fonte

### Treinamento
- Catalogo de cursos com categorias, dificuldade e duracao
- Sistema de enrollment com progresso e score
- Cursos obrigatorios e pre-requisitos por nivel
- Recompensa em XP por conclusao

### Analytics e Monitoramento
- Dashboard com metricas operacionais
- Relatorios e insights automatizados
- Web Vitals integrado
- Sentry para error tracking (client, server, edge)

### Integracao
- Webhooks configuráveis por evento com logs de entrega
- Notificacoes internas por usuario
- E-mail transacional via Resend
- Log de atividades com auditoria completa

---

## Primeiros Passos

### Pre-requisitos

- Node.js 20+
- Conta no [Neon](https://neon.tech) (PostgreSQL serverless)

### Instalacao

```bash
git clone https://github.com/institutoveigacabral-maker/restaurant-crm.git
cd restaurant-crm
npm install
```

### Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
AUTH_SECRET=sua-chave-secreta
RESEND_API_KEY=re_xxxx           # opcional, para envio de e-mails
SENTRY_DSN=https://xxxx@sentry.io # opcional, para monitoramento
```

### Banco de Dados

```bash
npm run db:push       # aplica o schema no Neon
npm run db:studio     # abre o Drizzle Studio (GUI)
npm run db:generate   # gera migrations
```

### Desenvolvimento

```bash
npm run dev           # inicia em http://localhost:3000
```

---

## Referencia da API

Todas as rotas estao em `src/app/api/`. Autenticacao via NextAuth.js (session cookie).

### Autenticacao
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `*` | `/api/auth/[...nextauth]` | Handlers do NextAuth.js |
| `POST` | `/api/auth/register` | Registro de novo usuario |

### Clientes
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/customers` | Listar / criar clientes |
| `GET/PUT/DELETE` | `/api/customers/[id]` | Detalhe / atualizar / remover cliente |

### Pedidos
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/orders` | Listar / criar pedidos |

### Reservas
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/reservations` | Listar / criar reservas |

### Cardapio
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/menu` | Categorias do cardapio |
| `GET/POST` | `/api/menu/items` | Itens do cardapio |

### Gamificacao
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/gamification/profile` | Perfil do funcionario (XP, nivel, streak) |
| `GET` | `/api/gamification/leaderboard` | Ranking da equipe |
| `GET` | `/api/gamification/badges` | Badges disponiveis e conquistadas |
| `GET/POST` | `/api/gamification/challenges` | Listar / criar desafios |
| `GET/PUT` | `/api/gamification/challenges/[id]` | Detalhe / atualizar desafio |

### Treinamento
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/training/courses` | Listar / criar cursos |
| `GET/PUT` | `/api/training/courses/[id]` | Detalhe / atualizar curso |
| `GET/POST` | `/api/training/enrollments` | Listar / criar matriculas |
| `GET/PUT` | `/api/training/enrollments/[id]` | Detalhe / atualizar progresso |

### Analytics
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/analytics/dashboard` | Metricas do dashboard |
| `GET` | `/api/analytics/insights` | Insights automatizados |
| `GET` | `/api/analytics/reports` | Relatorios |
| `POST` | `/api/analytics/vitals` | Recebe Web Vitals do client |

### Notificacoes e E-mail
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/notifications` | Notificacoes do usuario |
| `POST` | `/api/email/send` | Envio de e-mail via Resend |

### Webhooks
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/POST` | `/api/webhooks` | Gerenciar webhooks |
| `GET` | `/api/webhooks/logs` | Logs de entrega |

### Configuracoes
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET/PUT` | `/api/settings` | Configuracoes do restaurante |
| `GET/PUT` | `/api/settings/flags` | Feature flags |

### Health
| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |

---

## Testes

O projeto possui 352 testes cobrindo unitarios, integracao e E2E.

```bash
npm test              # roda todos os testes (Vitest)
npm run test:watch    # modo watch
npm run test:coverage # com relatorio de cobertura
npm run test:e2e      # testes E2E (Playwright)
npm run test:e2e:ui   # E2E com interface visual
```

### Validacao completa

```bash
npm run validate      # typecheck + lint + testes
```

---

## Arquitetura

```
src/
├── app/
│   ├── (auth)/            # Paginas de login e registro
│   ├── (dashboard)/       # Paginas protegidas do painel
│   └── api/               # API Routes (28 endpoints)
│       ├── analytics/     # Dashboard, insights, reports, vitals
│       ├── auth/          # NextAuth + registro
│       ├── customers/     # CRUD de clientes
│       ├── email/         # Envio transacional
│       ├── gamification/  # Perfil, badges, desafios, leaderboard
│       ├── health/        # Health check
│       ├── menu/          # Categorias e itens
│       ├── notifications/ # Notificacoes internas
│       ├── orders/        # Pedidos
│       ├── reservations/  # Reservas
│       ├── settings/      # Configuracoes e feature flags
│       ├── training/      # Cursos e matriculas
│       └── webhooks/      # Webhooks e logs
├── components/            # Componentes React reutilizaveis
├── data/                  # Dados estaticos
├── db/
│   ├── index.ts           # Conexao Neon/Drizzle
│   └── schema.ts          # Schema completo (26 tabelas)
├── lib/                   # Utilitarios e auth config
├── services/              # Camada de servicos (logica de negocio)
├── types/                 # Tipos TypeScript compartilhados
├── middleware.ts           # Protecao de rotas via NextAuth
├── instrumentation.ts     # Sentry instrumentation
└── __tests__/             # Testes unitarios e de integracao
```

### Decisoes Tecnicas

- **App Router** com route groups para separar auth e dashboard
- **Drizzle ORM** com schema declarativo e push direto para Neon (sem migrations em producao)
- **Soft delete** com campo `deletedAt` nas entidades principais
- **JSONB** para dados flexiveis (itens de pedido, horarios, criterios de badges)
- **Sentry** configurado em tres camadas: client, server e edge
- **Middleware** protege todas as rotas exceto auth, assets e API de autenticacao

---

## Deploy

### Vercel (recomendado)

1. Importe o repositorio no [Vercel](https://vercel.com)
2. Configure as variaveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`)
3. O deploy e automatico a cada push na `main`

### Neon (banco de dados)

1. Crie um projeto no [Neon](https://neon.tech)
2. Copie a connection string para `DATABASE_URL`
3. Execute `npm run db:push` para criar as tabelas

---

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para guia completo de branches, commits e pull requests.

---

## Licenca

Distribuido sob a licenca MIT. Veja [LICENSE](LICENSE) para detalhes.
