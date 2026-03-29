# Restaurant CRM

[![CI](https://github.com/hlemos1/restaurant-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/hlemos1/restaurant-crm/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Production](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square)](https://deploy-restaurant-crm.vercel.app)

> Complete restaurant management system that goes beyond traditional CRM. Combines customer control, orders, reservations, and menus with gamification modules for team engagement, training platform with courses and certifications, configurable webhooks, and real-time analytics dashboards.

🔗 **Live:** [deploy-restaurant-crm.vercel.app](https://deploy-restaurant-crm.vercel.app)

---

## ✨ Key Features

- **CRM** — Customer lifecycle management, loyalty tracking, and segmentation
- **Gamification** — Points, badges, leaderboards, and team engagement mechanics
- **Training Platform** — Courses, certifications, and performance tracking for staff
- **Analytics** — Real-time dashboards with Recharts + Vercel Speed Insights
- **Webhooks** — Configurable event system for third-party integrations
- **Multi-tenant** — Org-level isolation for restaurant chains
- **E2E Testing** — Full Playwright test suite with GitHub Actions CI

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript |
| **Database** | PostgreSQL serverless (Neon) |
| **ORM** | Drizzle ORM |
| **Auth** | NextAuth.js v5 |
| **UI** | Tailwind CSS 4 + shadcn/ui + Lucide Icons |
| **Charts** | Recharts |
| **Email** | Resend |
| **Observability** | Sentry (client, server, edge) + Web Vitals |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Validation** | Zod 4 |
| **Testing** | Vitest + Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel |

---

## 🏗️ Architecture

```
restaurant-crm/
├── src/
│   ├── app/             # Next.js App Router (pages & API routes)
│   ├── components/      # shadcn/ui components
│   ├── lib/             # Drizzle ORM, auth config, webhooks
│   └── modules/
│       ├── crm/         # Customer management
│       ├── gamification/ # Points, badges, leaderboards
│       ├── training/    # Courses & certifications
│       └── analytics/   # Dashboard & reporting
├── drizzle/             # Database migrations
├── e2e/                 # Playwright E2E tests
└── .github/workflows/   # CI/CD pipelines
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/hlemos1/restaurant-crm.git
cd restaurant-crm

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Run CI pipeline locally
pnpm test:ci
```

---

## 📊 Production Metrics

- ✅ Multi-tenant restaurant chain support
- ✅ Gamification engine with real-time leaderboards
- ✅ Sentry error monitoring (client + server + edge)
- ✅ Lighthouse CI performance gates
- ✅ Playwright E2E test suite
- ✅ GitHub Actions CI/CD pipeline

---

## 📄 License

MIT © [Henrique Lemos](https://github.com/hlemos1)
