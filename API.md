# Restaurant CRM -- API Reference

## Autenticacao

Autenticacao via sessao (NextAuth.js). Login com email/senha ou registro.

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/auth/register` | Registrar usuario |
| * | `/api/auth/[...nextauth]` | NextAuth handlers |

---

## Clientes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/customers` | Listar clientes |
| POST | `/api/customers` | Criar cliente |
| PUT | `/api/customers` | Atualizar cliente |
| DELETE | `/api/customers` | Remover cliente |
| GET | `/api/customers/:id` | Detalhes do cliente |

## Pedidos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/orders` | Listar pedidos |
| PUT | `/api/orders` | Atualizar pedido |
| DELETE | `/api/orders` | Remover pedido |

## Reservas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/reservations` | Listar reservas |
| POST | `/api/reservations` | Criar reserva |
| PUT | `/api/reservations` | Atualizar reserva |
| DELETE | `/api/reservations` | Remover reserva |

## Cardapio

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/menu` | Listar categorias |
| POST | `/api/menu` | Criar categoria |
| GET | `/api/menu/items` | Listar itens |
| POST | `/api/menu/items` | Criar item |
| PUT | `/api/menu/items` | Atualizar item |
| DELETE | `/api/menu/items` | Remover item |

## Gamificacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/gamification/profile` | Perfil de gamificacao |
| GET | `/api/gamification/leaderboard` | Ranking |
| GET | `/api/gamification/badges` | Listar badges |
| POST | `/api/gamification/badges` | Criar badge |
| GET | `/api/gamification/challenges` | Listar desafios |
| POST | `/api/gamification/challenges/:id` | Criar desafio |
| PUT | `/api/gamification/challenges/:id` | Atualizar desafio |

## Treinamento

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/training/courses` | Listar cursos |
| POST | `/api/training/courses` | Criar curso |
| GET | `/api/training/courses/:id` | Detalhes |
| PUT | `/api/training/courses/:id` | Atualizar |
| DELETE | `/api/training/courses/:id` | Remover |
| GET | `/api/training/enrollments` | Listar matriculas |
| POST | `/api/training/enrollments` | Matricular |
| PUT | `/api/training/enrollments/:id` | Atualizar progresso |

## Analytics

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/analytics/dashboard` | Dashboard principal |
| GET | `/api/analytics/insights` | Insights IA |
| GET | `/api/analytics/reports` | Relatorios |
| POST | `/api/analytics/vitals` | Enviar Web Vitals |

## Webhooks

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/webhooks` | Listar webhooks |
| POST | `/api/webhooks` | Criar webhook |
| PUT | `/api/webhooks` | Atualizar |
| DELETE | `/api/webhooks` | Remover |
| GET | `/api/webhooks/logs` | Logs de execucao |

## Configuracoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/settings` | Configuracoes |
| PUT | `/api/settings` | Atualizar |
| GET | `/api/settings/flags` | Feature flags |
| POST | `/api/settings/flags` | Atualizar flags |

## Notificacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/notifications` | Listar |
| POST | `/api/notifications` | Criar |
| PUT | `/api/notifications` | Marcar como lida |

## Health

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/health` | Status do sistema (DB, memoria, uptime) |
