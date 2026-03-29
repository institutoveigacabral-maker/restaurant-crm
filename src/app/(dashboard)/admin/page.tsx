"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Users,
  UserCheck,
  FileText,
  Crown,
  Star,
  Rocket,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── Plans (static) ──────────────────────────────────────────

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "99",
    features: [
      "1 marca",
      "10 SOPs",
      "2 clones",
      "3 automacoes",
      "Suporte por email",
      "Dashboard basico",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "249",
    popular: true,
    features: [
      "3 marcas",
      "SOPs ilimitados",
      "5 clones",
      "10 automacoes",
      "Suporte prioritario",
      "Dashboard avancado",
      "API access",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    features: [
      "Marcas ilimitadas",
      "SOPs ilimitados",
      "Clones ilimitados",
      "Automacoes ilimitadas",
      "Account manager dedicado",
      "SLA garantido",
      "Custom integrations",
      "On-premise option",
    ],
  },
];

// ── Types ───────────────────────────────────────────────────

interface TenantStats {
  users: number;
  customers: number;
  sops: number;
  diagnostics: number;
}

interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  plan: string | null;
  primaryColor: string | null;
  active: boolean | null;
  type: "grupo" | "marca";
  stats: TenantStats;
  children?: TenantWithStats[];
}

interface StatsData {
  totals: {
    tenants: number;
    users: number;
    customers: number;
    sops: number;
    diagnostics: number;
  };
  customersPerTenant: { tenantName: string; count: number }[];
}

// ── Component ───────────────────────────────────────────────

export default function AdminPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role as string;

  const [stats, setStats] = useState<StatsData | null>(null);
  const [tenantData, setTenantData] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "owner") return;

    async function load() {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/tenants"),
        ]);

        const statsJson = await statsRes.json();
        const tenantsJson = await tenantsRes.json();

        if (statsJson.success) setStats(statsJson.data);

        if (tenantsJson.success) {
          const { hierarchy, standalone } = tenantsJson.data;
          // Flatten for table: parent rows + children
          const flat: TenantWithStats[] = [];
          for (const group of hierarchy) {
            flat.push(group);
            for (const child of group.children ?? []) {
              flat.push(child);
            }
          }
          for (const s of standalone ?? []) {
            flat.push(s);
          }
          setTenantData(flat);
        }
      } catch (err) {
        console.error("[Admin] Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [role]);

  // ── Guard: not owner ──────────────────────────────────────

  if (role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ShieldAlert className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-bold">Acesso restrito</h2>
            <p className="text-sm text-muted-foreground text-center">
              Esta pagina e exclusiva para owners da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Stat cards ────────────────────────────────────────────

  const statCards = [
    {
      title: "Total Tenants",
      value: stats?.totals.tenants ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: stats?.totals.users ?? 0,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Clientes",
      value: stats?.totals.customers ?? 0,
      icon: UserCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total SOPs",
      value: stats?.totals.sops ?? 0,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const chartData = (stats?.customersPerTenant ?? []).map((item) => ({
    name: item.tenantName,
    clientes: item.count,
  }));

  // ── Plan badge ────────────────────────────────────────────

  const planBadge = (plan: string | null) => {
    const p = plan ?? "starter";
    const variants: Record<string, string> = {
      starter: "bg-gray-100 text-gray-700",
      pro: "bg-blue-100 text-blue-700",
      enterprise: "bg-purple-100 text-purple-700",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[p] ?? variants.starter}`}
      >
        {p.charAt(0).toUpperCase() + p.slice(1)}
      </span>
    );
  };

  const typeBadge = (type: "grupo" | "marca") => {
    if (type === "grupo") {
      return (
        <Badge variant="default" className="text-xs">
          Grupo
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Marca
      </Badge>
    );
  };

  // Current plan for the platform
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userTenantId = (session?.user as any)?.tenantId;
  const currentPlan = userTenantId
    ? (tenantData.find((t) => t.id === userTenantId)?.plan ?? "starter")
    : "starter";

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestao de tenants, metricas globais e planos
        </p>
      </div>

      {/* Section: Visao Geral */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Visao Geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-lg`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Distribution chart */}
        {chartData.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Clientes por Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="clientes" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Section: Tenants */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tenants</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Clientes</TableHead>
                  <TableHead className="text-right">SOPs</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum tenant encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  tenantData.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        {tenant.type === "marca" && (
                          <span className="text-muted-foreground mr-2">--</span>
                        )}
                        {tenant.name}
                      </TableCell>
                      <TableCell>{typeBadge(tenant.type)}</TableCell>
                      <TableCell>{planBadge(tenant.plan)}</TableCell>
                      <TableCell className="text-right">{tenant.stats.customers}</TableCell>
                      <TableCell className="text-right">{tenant.stats.sops}</TableCell>
                      <TableCell className="text-right">{tenant.stats.users}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled>
                          Gerir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Section: Planos e Pricing */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Planos e Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            return (
              <Card
                key={plan.key}
                className={`relative ${plan.popular ? "border-blue-500 border-2" : ""} ${isCurrent ? "ring-2 ring-orange-400" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white text-xs">Mais popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-orange-500 text-white text-xs">Atual</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2">
                    {plan.key === "starter" && <Star className="w-8 h-8 text-gray-500" />}
                    {plan.key === "pro" && <Rocket className="w-8 h-8 text-blue-500" />}
                    {plan.key === "enterprise" && <Crown className="w-8 h-8 text-purple-500" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    {plan.price ? (
                      <p className="text-3xl font-bold">
                        {plan.price}
                        <span className="text-sm font-normal text-muted-foreground"> EUR/mes</span>
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-muted-foreground">Sob consulta</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500 font-bold">+</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.key === "enterprise" ? (
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contactar
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isCurrent ? "secondary" : "default"}
                      disabled={isCurrent}
                    >
                      {isCurrent ? "Plano atual" : "Selecionar"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
