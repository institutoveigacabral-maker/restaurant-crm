"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, TrendingUp, Receipt, FileText, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────

interface KpiData {
  customers: { total: number; newThisMonth: number; trend: string };
  reservations: { today: number; thisWeek: number; trend: string };
  orders: { today: number; revenue: number; avgTicket: number };
  sops: { total: number; published: number };
  team: { totalXp: number; avgLevel: number; activeMembers: number };
}

interface ChartData {
  revenueByDay: { date: string; revenue: number }[];
  reservationsByDay: { date: string; count: number }[];
  topCustomers: { name: string; spent: number; visits: number }[];
}

// ── Skeleton Components ──────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="bg-muted p-2.5 rounded-xl w-10 h-10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── KPI Card ─────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  trend,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.startsWith("+")
                    ? "text-green-600"
                    : trend.startsWith("-")
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Formatters ───────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

// ── Page ─────────────────────────────────────────────────────

export default function DashboardExecutivoPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          fetch("/api/analytics/kpis"),
          fetch("/api/analytics/charts"),
        ]);

        const [kpiJson, chartJson] = await Promise.all([kpiRes.json(), chartRes.json()]);

        if (kpiJson.success) setKpis(kpiJson.data);
        if (chartJson.success) setCharts(chartJson.data);
      } catch (err) {
        console.error("[Dashboard] Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
          <p className="text-muted-foreground">Visao consolidada do grupo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
        <p className="text-muted-foreground">Visao consolidada do grupo</p>
      </div>

      {/* ── KPI Cards (2x3 grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          icon={Users}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-600"
          value={String(kpis?.customers.total ?? 0)}
          label="Clientes totais"
          trend={kpis?.customers.trend}
        />
        <KpiCard
          icon={CalendarDays}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
          value={String(kpis?.reservations.today ?? 0)}
          label="Reservas hoje"
          trend={kpis?.reservations.trend}
        />
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-green-500/10"
          iconColor="text-green-600"
          value={formatCurrency(kpis?.orders.revenue ?? 0)}
          label="Receita do dia"
        />
        <KpiCard
          icon={Receipt}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={formatCurrency(kpis?.orders.avgTicket ?? 0)}
          label="Ticket medio"
        />
        <KpiCard
          icon={FileText}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-600"
          value={`${kpis?.sops.published ?? 0}/${kpis?.sops.total ?? 0}`}
          label="SOPs publicados"
        />
        <KpiCard
          icon={Zap}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={String(kpis?.team.totalXp ?? 0)}
          label={`XP equipa (${kpis?.team.activeMembers ?? 0} membros)`}
        />
      </div>

      {/* ── Charts (2 colunas) ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue 30 dias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita - ultimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.revenueByDay && charts.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={charts.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
                    labelFormatter={(label) => formatDateShort(String(label))}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados de receita nos ultimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservas 30 dias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservas - ultimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.reservationsByDay && charts.reservationsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.reservationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Reservas"]}
                    labelFormatter={(label) => formatDateShort(String(label))}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Sem reservas nos ultimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Clientes ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {charts?.topCustomers && charts.topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Nome</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Visitas</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Total gasto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {charts.topCustomers.map((c) => (
                    <tr key={c.name} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{c.name}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{c.visits}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(c.spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Sem dados de clientes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
