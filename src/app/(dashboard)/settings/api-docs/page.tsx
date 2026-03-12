"use client";

import { FileCode, Lock, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface Endpoint {
  method: HttpMethod;
  path: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseExample: string;
}

interface EndpointSection {
  key: string;
  label: string;
  endpoints: Endpoint[];
}

const METHOD_STYLES: Record<
  HttpMethod,
  { variant: "default" | "secondary" | "outline" | "destructive"; className: string }
> = {
  GET: { variant: "default", className: "bg-green-600 hover:bg-green-700 text-white" },
  POST: {
    variant: "secondary",
    className: "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  },
  PUT: {
    variant: "outline",
    className: "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  },
  DELETE: { variant: "destructive", className: "" },
};

const sections: EndpointSection[] = [
  {
    key: "auth",
    label: "Autenticação",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "Registrar novo usuário",
        auth: false,
        requestBody: JSON.stringify(
          { name: "João Silva", email: "joao@email.com", password: "senha123" },
          null,
          2
        ),
        responseExample: JSON.stringify(
          { id: "abc123", name: "João Silva", email: "joao@email.com", role: "garcom" },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/auth/[...nextauth]",
        description: "Login (NextAuth.js) — autenticação via credenciais ou providers",
        auth: false,
        requestBody: JSON.stringify({ email: "joao@email.com", password: "senha123" }, null, 2),
        responseExample: JSON.stringify(
          {
            user: { id: "abc123", name: "João Silva", email: "joao@email.com", role: "garcom" },
            expires: "2026-04-10T00:00:00.000Z",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    key: "customers",
    label: "Clientes",
    endpoints: [
      {
        method: "GET",
        path: "/api/customers",
        description: "Listar todos os clientes",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "c1",
              name: "Maria Santos",
              email: "maria@email.com",
              phone: "(11) 99999-0000",
              tags: ["VIP"],
              notes: "Cliente frequente",
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/customers",
        description: "Criar novo cliente",
        auth: true,
        requestBody: JSON.stringify(
          {
            name: "Maria Santos",
            email: "maria@email.com",
            phone: "(11) 99999-0000",
            tags: ["VIP"],
            notes: "Cliente frequente",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "c1",
            name: "Maria Santos",
            email: "maria@email.com",
            phone: "(11) 99999-0000",
            tags: ["VIP"],
            notes: "Cliente frequente",
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/customers",
        description: "Atualizar dados do cliente",
        auth: true,
        requestBody: JSON.stringify(
          {
            id: "c1",
            name: "Maria Santos",
            email: "maria@novo.com",
            phone: "(11) 99999-1111",
            tags: ["VIP", "Aniversário"],
            notes: "Atualizado",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "c1",
            name: "Maria Santos",
            email: "maria@novo.com",
            phone: "(11) 99999-1111",
            tags: ["VIP", "Aniversário"],
            notes: "Atualizado",
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/customers?id=X",
        description: "Excluir cliente (requer role admin ou gerente)",
        auth: true,
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
      {
        method: "GET",
        path: "/api/customers/[id]",
        description: "Perfil completo do cliente com reservas e pedidos",
        auth: true,
        responseExample: JSON.stringify(
          {
            id: "c1",
            name: "Maria Santos",
            email: "maria@email.com",
            reservations: [{ id: "r1", date: "2026-03-15", time: "19:00", guests: 4 }],
            orders: [{ id: "o1", total: 150.0, status: "concluido" }],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    key: "reservations",
    label: "Reservas",
    endpoints: [
      {
        method: "GET",
        path: "/api/reservations",
        description: "Listar todas as reservas",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "r1",
              customerId: "c1",
              customerName: "Maria Santos",
              date: "2026-03-15",
              time: "19:00",
              guests: 4,
              table: "Mesa 5",
              status: "confirmada",
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/reservations",
        description: "Criar nova reserva",
        auth: true,
        requestBody: JSON.stringify(
          {
            customerId: "c1",
            customerName: "Maria Santos",
            date: "2026-03-15",
            time: "19:00",
            guests: 4,
            table: "Mesa 5",
            status: "confirmada",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "r1",
            customerId: "c1",
            customerName: "Maria Santos",
            date: "2026-03-15",
            time: "19:00",
            guests: 4,
            table: "Mesa 5",
            status: "confirmada",
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/reservations",
        description: "Atualizar reserva existente",
        auth: true,
        requestBody: JSON.stringify(
          {
            id: "r1",
            date: "2026-03-16",
            time: "20:00",
            guests: 6,
            table: "Mesa 8",
            status: "confirmada",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "r1",
            date: "2026-03-16",
            time: "20:00",
            guests: 6,
            table: "Mesa 8",
            status: "confirmada",
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/reservations?id=X",
        description: "Excluir reserva",
        auth: true,
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
    ],
  },
  {
    key: "orders",
    label: "Pedidos",
    endpoints: [
      {
        method: "GET",
        path: "/api/orders",
        description: "Listar todos os pedidos",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "o1",
              customerId: "c1",
              items: [{ name: "Risoto", quantity: 1, price: 65.0 }],
              total: 65.0,
              status: "preparando",
            },
          ],
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/orders",
        description: "Atualizar status do pedido",
        auth: true,
        requestBody: JSON.stringify({ id: "o1", status: "pronto" }, null, 2),
        responseExample: JSON.stringify(
          { id: "o1", status: "pronto", updatedAt: "2026-03-10T12:00:00.000Z" },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/orders?id=X",
        description: "Excluir pedido",
        auth: true,
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
    ],
  },
  {
    key: "menu",
    label: "Cardápio",
    endpoints: [
      {
        method: "GET",
        path: "/api/menu",
        description: "Listar categorias do cardápio",
        auth: true,
        responseExample: JSON.stringify(
          [{ id: "cat1", name: "Entradas", description: "Pratos de entrada" }],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/menu",
        description: "Criar nova categoria",
        auth: true,
        requestBody: JSON.stringify(
          { name: "Entradas", description: "Pratos de entrada" },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "cat1",
            name: "Entradas",
            description: "Pratos de entrada",
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/menu/items",
        description: "Listar itens do cardápio",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "item1",
              categoryId: "cat1",
              name: "Bruschetta",
              description: "Pão italiano com tomate",
              price: 28.0,
              available: true,
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/menu/items",
        description: "Criar novo item no cardápio",
        auth: true,
        requestBody: JSON.stringify(
          {
            categoryId: "cat1",
            name: "Bruschetta",
            description: "Pão italiano com tomate",
            price: 28.0,
            available: true,
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "item1",
            categoryId: "cat1",
            name: "Bruschetta",
            description: "Pão italiano com tomate",
            price: 28.0,
            available: true,
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/menu/items",
        description: "Atualizar item do cardápio",
        auth: true,
        requestBody: JSON.stringify(
          { id: "item1", name: "Bruschetta Especial", price: 32.0, available: true },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "item1",
            name: "Bruschetta Especial",
            price: 32.0,
            available: true,
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/menu/items?id=X",
        description: "Excluir item do cardápio",
        auth: true,
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
    ],
  },
  {
    key: "analytics",
    label: "Analytics",
    endpoints: [
      {
        method: "GET",
        path: "/api/analytics/dashboard?period=month&from=X&to=Y",
        description: "Dados do dashboard com métricas agregadas",
        auth: true,
        responseExample: JSON.stringify(
          {
            totalRevenue: 45200.0,
            totalOrders: 312,
            averageTicket: 144.87,
            occupancyRate: 0.78,
            period: "month",
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/analytics/reports?type=sales&from=X&to=Y",
        description: "Relatórios detalhados (tipos: sales, dishes, customers, occupancy)",
        auth: true,
        responseExample: JSON.stringify(
          {
            type: "sales",
            data: [{ date: "2026-03-01", revenue: 1520.0, orders: 12 }],
            total: 45200.0,
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/analytics/insights",
        description: "Insights automáticos gerados pelo sistema",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "i1",
              type: "trend",
              title: "Aumento de reservas",
              description: "Reservas cresceram 15% esta semana",
              priority: "high",
            },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    key: "notifications",
    label: "Notificações",
    endpoints: [
      {
        method: "GET",
        path: "/api/notifications",
        description: "Listar notificações do usuário autenticado",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "n1",
              title: "Nova reserva",
              message: "Maria Santos fez uma reserva para 15/03",
              read: false,
              createdAt: "2026-03-10T10:00:00.000Z",
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/notifications",
        description: "Criar notificação (requer role admin)",
        auth: true,
        requestBody: JSON.stringify(
          { title: "Aviso", message: "Reunião às 14h", userId: "user1" },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "n2",
            title: "Aviso",
            message: "Reunião às 14h",
            read: false,
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/notifications",
        description: "Marcar como lida (uma ou todas)",
        auth: true,
        requestBody: JSON.stringify({ id: "n1" }, null, 2),
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
    ],
  },
  {
    key: "webhooks",
    label: "Webhooks",
    endpoints: [
      {
        method: "GET",
        path: "/api/webhooks",
        description: "Listar webhooks configurados (admin)",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "w1",
              name: "Notificar Slack",
              url: "https://hooks.slack.com/...",
              events: ["reservation.created", "order.completed"],
              active: true,
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/webhooks",
        description: "Criar novo webhook",
        auth: true,
        requestBody: JSON.stringify(
          {
            name: "Notificar Slack",
            url: "https://hooks.slack.com/...",
            events: ["reservation.created", "order.completed"],
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "w1",
            name: "Notificar Slack",
            url: "https://hooks.slack.com/...",
            events: ["reservation.created", "order.completed"],
            active: true,
            createdAt: "2026-03-10T10:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/webhooks",
        description: "Atualizar webhook existente",
        auth: true,
        requestBody: JSON.stringify(
          { id: "w1", name: "Slack Atualizado", events: ["reservation.created"] },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "w1",
            name: "Slack Atualizado",
            events: ["reservation.created"],
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/webhooks?id=X",
        description: "Excluir webhook",
        auth: true,
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
      {
        method: "GET",
        path: "/api/webhooks/logs?webhookId=X",
        description: "Visualizar logs de execução do webhook",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "l1",
              webhookId: "w1",
              event: "reservation.created",
              status: 200,
              response: "ok",
              executedAt: "2026-03-10T10:05:00.000Z",
            },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    key: "email",
    label: "Email",
    endpoints: [
      {
        method: "POST",
        path: "/api/email/send",
        description: "Enviar email usando template (requer role admin)",
        auth: true,
        requestBody: JSON.stringify(
          {
            template: "reservation-confirmation",
            to: "maria@email.com",
            data: { customerName: "Maria Santos", date: "15/03/2026", time: "19:00" },
          },
          null,
          2
        ),
        responseExample: JSON.stringify({ success: true, messageId: "msg_abc123" }, null, 2),
      },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    endpoints: [
      {
        method: "GET",
        path: "/api/settings",
        description: "Obter configurações do restaurante",
        auth: true,
        responseExample: JSON.stringify(
          {
            restaurantName: "Restaurante Exemplo",
            address: "Rua Principal, 100",
            phone: "(11) 3333-0000",
            openingHours: "11:00-23:00",
            maxCapacity: 80,
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/api/settings",
        description: "Atualizar configurações (requer role admin)",
        auth: true,
        requestBody: JSON.stringify(
          { restaurantName: "Novo Nome", phone: "(11) 3333-1111", maxCapacity: 100 },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            restaurantName: "Novo Nome",
            phone: "(11) 3333-1111",
            maxCapacity: 100,
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/settings/flags",
        description: "Listar feature flags do sistema",
        auth: true,
        responseExample: JSON.stringify(
          [
            {
              id: "f1",
              key: "enable_ai_insights",
              value: true,
              description: "Habilitar insights por IA",
            },
          ],
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/settings/flags",
        description: "Criar ou atualizar feature flag (requer role admin)",
        auth: true,
        requestBody: JSON.stringify(
          { key: "enable_ai_insights", value: true, description: "Habilitar insights por IA" },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "f1",
            key: "enable_ai_insights",
            value: true,
            description: "Habilitar insights por IA",
            updatedAt: "2026-03-10T12:00:00.000Z",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    key: "system",
    label: "Sistema",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        description: "Health check do sistema (sem autenticação)",
        auth: false,
        responseExample: JSON.stringify(
          { status: "ok", timestamp: "2026-03-10T10:00:00.000Z", version: "1.0.0" },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/analytics/vitals",
        description: "Envio de Web Vitals do navegador (sem autenticação)",
        auth: false,
        requestBody: JSON.stringify(
          { name: "LCP", value: 1200, rating: "good", navigationType: "navigate" },
          null,
          2
        ),
        responseExample: JSON.stringify({ success: true }, null, 2),
      },
    ],
  },
];

function MethodBadge({ method }: { method: HttpMethod }) {
  const style = METHOD_STYLES[method];
  return (
    <Badge variant={style.variant} className={`font-mono font-bold text-xs ${style.className}`}>
      {method}
    </Badge>
  );
}

function AuthBadge({ required }: { required: boolean }) {
  if (required) {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Lock className="w-3 h-3" />
        Auth obrigatória
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Globe className="w-3 h-3" />
      Pública
    </Badge>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm font-mono font-semibold">{endpoint.path}</code>
          <AuthBadge required={endpoint.auth} />
        </div>
        <CardTitle className="text-base mt-2">{endpoint.description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoint.requestBody && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Corpo da requisição:</p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              {endpoint.requestBody}
            </pre>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Exemplo de resposta:</p>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {endpoint.responseExample}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <FileCode className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Documentação da API</h1>
          <p className="text-muted-foreground">
            Referência completa de todos os endpoints disponíveis no RestaurantCRM
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Informações gerais</h2>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm">
              <span className="font-medium">Base URL:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                http://localhost:3000
              </code>
            </p>
            <p className="text-sm">
              <span className="font-medium">Autenticação:</span> A maioria dos endpoints requer
              sessão autenticada via NextAuth.js. Endpoints públicos são indicados com o badge
              &quot;Pública&quot;.
            </p>
            <p className="text-sm">
              <span className="font-medium">Formato:</span> Todos os endpoints aceitam e retornam
              JSON (
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                Content-Type: application/json
              </code>
              ).
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <span className="text-sm font-medium">Métodos:</span>
              <MethodBadge method="GET" />
              <MethodBadge method="POST" />
              <MethodBadge method="PUT" />
              <MethodBadge method="DELETE" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auth" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="text-xs">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.key} value={section.key} className="space-y-4">
            <h2 className="text-xl font-semibold">{section.label}</h2>
            {section.endpoints.map((endpoint) => (
              <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
