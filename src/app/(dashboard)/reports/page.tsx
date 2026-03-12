"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchReport } from "@/lib/api";
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
} from "recharts";

// ── Types ────────────────────────────────────────────────────

interface SalesDay {
  date: string;
  revenue: number;
}

interface SalesReport {
  daily: SalesDay[];
  totalRevenue: number;
  averageDaily: number;
  bestDay: { date: string; revenue: number };
  worstDay: { date: string; revenue: number };
}

interface DishRow {
  name: string;
  quantity: number;
  totalRevenue: number;
  avgPrice: number;
}

interface DishesReport {
  dishes: DishRow[];
}

interface CustomerRow {
  name: string;
  email: string;
  visits: number;
  totalSpent: number;
  avgTicket: number;
  lastVisit: string;
}

interface CustomersReport {
  customers: CustomerRow[];
}

interface OccupancyReport {
  byDayOfWeek: { day: string; reservations: number }[];
  byHour: { hour: string; reservations: number }[];
  avgGuests: number;
}

// ── Constants ────────────────────────────────────────────────

const CHART_COLORS = [
  "#ea580c",
  "#16a34a",
  "#2563eb",
  "#9333ea",
  "#e11d48",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
  "#4f46e5",
  "#059669",
];

// ── Helpers ──────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDefaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function getDefaultTo(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Skeleton Components ──────────────────────────────────────

function ChartSkeleton() {
  return <div className="h-72 w-full animate-pulse rounded-lg bg-muted" />;
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border bg-card p-6">
          <div className="mb-2 h-3 w-24 rounded bg-muted" />
          <div className="h-7 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border">
      <div className="h-10 border-b bg-muted/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-0">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [from, setFrom] = useState(getDefaultFrom);
  const [to, setTo] = useState(getDefaultTo);

  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [dishesData, setDishesData] = useState<DishesReport | null>(null);
  const [customersData, setCustomersData] = useState<CustomersReport | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyReport | null>(null);

  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(
    async (tab: string) => {
      setLoading(true);
      try {
        const data = await fetchReport(tab, from, to);
        switch (tab) {
          case "sales":
            setSalesData(data as unknown as SalesReport);
            break;
          case "dishes":
            setDishesData(data as unknown as DishesReport);
            break;
          case "customers":
            setCustomersData(data as unknown as CustomersReport);
            break;
          case "occupancy":
            setOccupancyData(data as unknown as OccupancyReport);
            break;
        }
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);
        else toast.error("Erro ao carregar relatório");
      } finally {
        setLoading(false);
      }
    },
    [from, to]
  );

  useEffect(() => {
    loadReport(activeTab);
  }, [activeTab, loadReport]);

  function handleTabChange(value: string) {
    setActiveTab(value ?? "sales");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho do restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">De</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Até</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="dishes">Pratos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
        </TabsList>

        {/* ── Vendas ──────────────────────────────────────────── */}
        <TabsContent value="sales" className="space-y-6">
          {loading ? (
            <>
              <CardsSkeleton />
              <ChartSkeleton />
            </>
          ) : salesData ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Média Diária
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(salesData.averageDaily)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Melhor Dia
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData.bestDay.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(salesData.bestDay.date)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pior Dia
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData.worstDay.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(salesData.worstDay.date)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Receita Diária</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCSV(
                        salesData.daily.map((d) => ({
                          data: d.date,
                          receita: d.revenue,
                        })),
                        "vendas.csv"
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={salesData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                      <YAxis tickFormatter={(v: number) => formatCurrency(v)} fontSize={12} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
                        labelFormatter={(label) => formatDate(String(label))}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ── Pratos ──────────────────────────────────────────── */}
        <TabsContent value="dishes" className="space-y-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <TableSkeleton rows={10} />
            </>
          ) : dishesData ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top 10 Pratos por Receita</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCSV(
                        dishesData.dishes.map((d) => ({
                          prato: d.name,
                          quantidade: d.quantity,
                          receita_total: d.totalRevenue,
                          preco_medio: d.avgPrice,
                        })),
                        "pratos.csv"
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dishesData.dishes.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis tickFormatter={(v: number) => formatCurrency(v)} fontSize={12} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Receita"]} />
                      <Bar dataKey="totalRevenue" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento por Prato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Prato</th>
                          <th className="pb-3 pr-4 font-medium text-right">Qtd. Vendida</th>
                          <th className="pb-3 pr-4 font-medium text-right">Receita Total</th>
                          <th className="pb-3 font-medium text-right">Preço Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dishesData.dishes.map((dish, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                                {dish.name}
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right">{dish.quantity}</td>
                            <td className="py-3 pr-4 text-right">
                              {formatCurrency(dish.totalRevenue)}
                            </td>
                            <td className="py-3 text-right">{formatCurrency(dish.avgPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ── Clientes ────────────────────────────────────────── */}
        <TabsContent value="customers" className="space-y-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <TableSkeleton rows={10} />
            </>
          ) : customersData ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top 10 Clientes por Gasto Total</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCSV(
                        customersData.customers.map((c) => ({
                          nome: c.name,
                          email: c.email,
                          visitas: c.visits,
                          gasto_total: c.totalSpent,
                          ticket_medio: c.avgTicket,
                          ultima_visita: c.lastVisit,
                        })),
                        "clientes.csv"
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={customersData.customers.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis tickFormatter={(v: number) => formatCurrency(v)} fontSize={12} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), "Gasto Total"]}
                      />
                      <Bar dataKey="totalSpent" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Nome</th>
                          <th className="pb-3 pr-4 font-medium">E-mail</th>
                          <th className="pb-3 pr-4 font-medium text-right">Visitas</th>
                          <th className="pb-3 pr-4 font-medium text-right">Gasto Total</th>
                          <th className="pb-3 pr-4 font-medium text-right">Ticket Médio</th>
                          <th className="pb-3 font-medium text-right">Última Visita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customersData.customers.map((customer, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {customer.name}
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground">{customer.email}</td>
                            <td className="py-3 pr-4 text-right">{customer.visits}</td>
                            <td className="py-3 pr-4 text-right">
                              {formatCurrency(customer.totalSpent)}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {formatCurrency(customer.avgTicket)}
                            </td>
                            <td className="py-3 text-right">
                              {customer.lastVisit
                                ? new Date(customer.lastVisit + "T00:00:00").toLocaleDateString(
                                    "pt-BR"
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ── Ocupação ────────────────────────────────────────── */}
        <TabsContent value="occupancy" className="space-y-6">
          {loading ? (
            <>
              <CardsSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : occupancyData ? (
            <>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Média de Convidados por Reserva
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{occupancyData.avgGuests.toFixed(1)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Reservas por Dia da Semana</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCSV(
                        [
                          ...occupancyData.byDayOfWeek.map((d) => ({
                            dia: d.day,
                            reservas: d.reservations,
                          })),
                        ],
                        "ocupacao.csv"
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={occupancyData.byDayOfWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [Number(value), "Reservas"]} />
                      <Bar dataKey="reservations" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Horário</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={occupancyData.byHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [Number(value), "Reservas"]} />
                      <Bar dataKey="reservations" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
