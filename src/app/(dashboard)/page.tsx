"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatSkeleton } from "@/components/LoadingSkeleton";
import { Customer, Reservation, Order } from "@/types";
import { fetchCustomers, fetchReservations, fetchOrders, fetchDashboardAnalytics } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#ea580c", "#16a34a", "#2563eb", "#9333ea", "#e11d48"];

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalReservations: number;
  totalNewCustomers: number;
  avgTicket: number;
  previousPeriodRevenue: number;
  previousPeriodOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  reservationsByStatus: { status: string; count: number }[];
  topCustomers: { name: string; totalSpent: number; visits: number }[];
  peakHours: { hour: string; reservations: number }[];
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  cancelled: "Cancelada",
  completed: "Concluída",
  preparing: "Preparando",
  served: "Servido",
  paid: "Pago",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "outline",
  cancelled: "destructive",
  completed: "secondary",
  preparing: "outline",
  served: "secondary",
  paid: "default",
};

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from = to;

  if (period === "today") {
    from = to;
  } else if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    from = d.toISOString().split("T")[0];
  } else if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    from = d.toISOString().split("T")[0];
  } else if (period === "year") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    from = d.toISOString().split("T")[0];
  }

  return { from, to };
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadAnalytics = useCallback(
    async (p: string) => {
      setAnalyticsLoading(true);
      try {
        const range = p === "custom" ? { from: customFrom, to: customTo } : getDateRange(p);
        const data = await fetchDashboardAnalytics(p, range.from, range.to);
        setAnalytics(data as unknown as AnalyticsData);
      } catch {
        // Analytics API may not exist yet, fall back silently
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [customFrom, customTo]
  );

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchReservations(), fetchOrders()])
      .then(([c, r, o]) => {
        setCustomers(c);
        setReservations(r);
        setOrders(o);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      loadAnalytics(period);
    }
  }, [loading, period, loadAnalytics]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadAnalytics(period);
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, period, loadAnalytics]);

  const today = new Date().toISOString().split("T")[0];
  const reservationsToday = reservations.filter((r) => r.date === today);
  const ordersToday = orders.filter((o) => o.date === today);

  // Use analytics data if available, otherwise fallback to client-side calc
  const totalRevenue =
    analytics?.totalRevenue ??
    ordersToday.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const totalOrders = analytics?.totalOrders ?? ordersToday.length;
  const avgTicket = analytics?.avgTicket ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const previousRevenue = analytics?.previousPeriodRevenue ?? 0;
  const previousOrders = analytics?.previousPeriodOrders ?? 0;
  const revenueChange = calcChange(totalRevenue, previousRevenue);
  const ordersChange = calcChange(totalOrders, previousOrders);

  // Chart data from analytics or fallback
  const revenueByDay = analytics?.revenueByDay ?? [];
  const ordersByStatusChart =
    analytics?.ordersByStatus?.map((s) => ({
      name: statusLabel[s.status] || s.status,
      value: s.count,
    })) ??
    orders.reduce(
      (acc, o) => {
        const label = statusLabel[o.status] || o.status;
        const existing = acc.find((item) => item.name === label);
        if (existing) existing.value++;
        else acc.push({ name: label, value: 1 });
        return acc;
      },
      [] as { name: string; value: number }[]
    );

  const topCustomersChart =
    analytics?.topCustomers?.slice(0, 5).map((c) => ({
      name: c.name.split(" ")[0],
      total: c.totalSpent,
    })) ??
    [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map((c) => ({
        name: c.name.split(" ")[0],
        total: c.totalSpent,
      }));

  const peakHours = analytics?.peakHours ?? [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do restaurante</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={period} onValueChange={(v) => setPeriod(v ?? "month")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {period === "custom" && (
            <>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-[150px]"
              />
              <Button size="sm" onClick={() => loadAnalytics("custom")}>
                Aplicar
              </Button>
            </>
          )}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Auto-refresh ativo (60s)" : "Ativar auto-refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.totalNewCustomers ?? customers.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics ? "novos no período" : "total cadastrados"}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservas</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.totalReservations ?? reservationsToday.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics ? "no período" : "hoje"}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                {previousRevenue > 0 && (
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {revenueChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {revenueChange >= 0 ? "+" : ""}
                    {revenueChange}% vs anterior
                  </div>
                )}
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(avgTicket)}</p>
                {previousOrders > 0 && (
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {ordersChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {ordersChange >= 0 ? "+" : ""}
                    {ordersChange}% pedidos vs anterior
                  </div>
                )}
              </div>
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      {revenueByDay.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickFormatter={(d) => {
                      const date = new Date(d + "T00:00:00");
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(d) => {
                      const date = new Date(String(d) + "T00:00:00");
                      return date.toLocaleDateString("pt-BR");
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.65 0.17 41)"
                    strokeWidth={2}
                    dot={revenueByDay.length < 31}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Clientes por Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomersChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="total" fill="oklch(0.65 0.17 41)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ordersByStatusChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Chart */}
      {peakHours.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Horários de Pico (Reservas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="reservations" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reservas de Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reservationsToday.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma reserva para hoje
              </p>
            )}
            {reservationsToday.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-sm">{r.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.time} · {r.guests} pessoas · {r.table}
                  </p>
                </div>
                <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pedidos Ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordersToday.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum pedido para hoje
              </p>
            )}
            {ordersToday.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-sm">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.length} itens · {formatCurrency(o.total)}
                  </p>
                </div>
                <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="spending">
            <TabsList>
              <TabsTrigger value="spending">Por Gasto</TabsTrigger>
              <TabsTrigger value="visits">Por Visitas</TabsTrigger>
            </TabsList>
            <TabsContent value="spending" className="mt-4">
              <div className="space-y-2">
                {[...customers]
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .slice(0, 5)
                  .map((c, i) => (
                    <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(c.totalSpent)}</p>
                        <p className="text-xs text-muted-foreground">{c.visits} visitas</p>
                      </div>
                      <div className="flex gap-1">
                        {c.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="visits" className="mt-4">
              <div className="space-y-2">
                {[...customers]
                  .sort((a, b) => b.visits - a.visits)
                  .slice(0, 5)
                  .map((c, i) => (
                    <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{c.visits} visitas</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(c.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Loading overlay for analytics refresh */}
      {analyticsLoading && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          Atualizando dados...
        </div>
      )}
    </div>
  );
}
