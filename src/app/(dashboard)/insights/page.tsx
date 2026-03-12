"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  TrendingUp,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CardSkeleton, StatSkeleton } from "@/components/LoadingSkeleton";
import { fetchInsights } from "@/lib/api";

interface ChurnCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string | null;
  totalSpent: string;
  visits: number;
}

interface VipCustomer {
  id: number;
  name: string;
  email: string;
  totalSpent: string;
  visits: number;
  tags: string[];
}

interface TrendsAlert {
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  revenueChange: number;
  thisWeekOrders: number;
  lastWeekOrders: number;
  ordersChange: number;
}

interface InsightsData {
  churnRisk: ChurnCustomer[];
  vipCustomers: VipCustomer[];
  trendsAlert: TrendsAlert;
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null): string {
  if (!date) return "Nunca";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function ChangeIndicator({ change }: { change: number }) {
  const isPositive = change >= 0;
  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
    >
      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
      <span className="text-muted-foreground font-normal text-xs">vs semana passada</span>
    </div>
  );
}

function ChurnRiskBadge({ totalSpent, visits }: { totalSpent: string; visits: number }) {
  const spent = parseFloat(totalSpent);
  const isHighRisk = spent > 500 || visits > 5;
  return (
    <Badge
      variant={isHighRisk ? "destructive" : "secondary"}
      className={isHighRisk ? "" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
    >
      {isHighRisk ? "Alto Risco" : "Medio Risco"}
    </Badge>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights()
      .then((raw) => setData(raw as unknown as InsightsData))
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-64 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar insights. Tente novamente mais tarde.
        </div>
      </div>
    );
  }

  const { churnRisk, vipCustomers, trendsAlert } = data;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Inteligencia automatica sobre seu restaurante</p>
      </div>

      {/* Trends Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita esta semana</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(trendsAlert.thisWeekRevenue)}
                </p>
                <div className="mt-2">
                  <ChangeIndicator change={trendsAlert.revenueChange} />
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos esta semana</p>
                <p className="text-2xl font-bold mt-1">{trendsAlert.thisWeekOrders}</p>
                <div className="mt-2">
                  <ChangeIndicator change={trendsAlert.ordersChange} />
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Churn Risk Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Clientes em Risco de Churn</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Clientes que nao visitam seu restaurante ha mais de 30 dias
          </p>
        </div>

        {churnRisk.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente em risco de churn no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {churnRisk.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <ChurnRiskBadge totalSpent={customer.totalSpent} visits={customer.visits} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Ultima visita: {formatDate(customer.lastVisit)}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-sm font-semibold">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total gasto</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{customer.visits}</p>
                      <p className="text-xs text-muted-foreground">Visitas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* VIP Customers Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Clientes VIP</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Seus clientes mais valiosos</p>
        </div>

        {vipCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente VIP identificado no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vipCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-sm font-semibold">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total gasto</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{customer.visits}</p>
                      <p className="text-xs text-muted-foreground">Visitas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
