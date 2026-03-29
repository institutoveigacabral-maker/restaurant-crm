"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  UtensilsCrossed,
  BookOpen,
  Heart,
  DollarSign,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCustomers, fetchReservations, fetchOrders } from "@/lib/api";

interface CrmStats {
  totalCustomers: number;
  reservationsToday: number;
  ordersToday: number;
  revenueMonth: number;
}

const crmModules = [
  {
    href: "/crm/clientes",
    title: "Clientes",
    description: "Base de clientes, historico, tags, fidelidade",
    icon: Users,
    color: "text-orange-600 bg-orange-500/10",
  },
  {
    href: "/crm/reservas",
    title: "Reservas",
    description: "Gestao de reservas, calendario, confirmacao",
    icon: CalendarDays,
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    href: "/crm/pedidos",
    title: "Pedidos",
    description: "Pedidos ativos, historico, status",
    icon: UtensilsCrossed,
    color: "text-green-600 bg-green-500/10",
  },
  {
    href: "/crm/cardapio",
    title: "Cardapio",
    description: "Menu por categoria, precos, disponibilidade",
    icon: BookOpen,
    color: "text-purple-600 bg-purple-500/10",
  },
  {
    href: "/receitas/fidelidade",
    title: "Fidelidade",
    description: "Programa de pontos, niveis, recompensas",
    icon: Heart,
    color: "text-pink-600 bg-pink-500/10",
  },
];

export default function CrmPage() {
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const monthStart = today.slice(0, 7);

    Promise.all([fetchCustomers(), fetchReservations(), fetchOrders()])
      .then(([customers, reservations, orders]) => {
        const reservationsToday = reservations.filter((r) => r.date === today).length;

        const ordersToday = orders.filter((o) => o.date === today).length;

        const revenueMonth = orders
          .filter((o) => o.date.startsWith(monthStart) && o.status !== "cancelled")
          .reduce((sum, o) => sum + o.total, 0);

        setStats({
          totalCustomers: customers.length,
          reservationsToday,
          ordersToday,
          revenueMonth,
        });
      })
      .catch(() => {
        setStats({
          totalCustomers: 0,
          reservationsToday: 0,
          ordersToday: 0,
          revenueMonth: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Clientes",
      value: stats?.totalCustomers ?? 0,
      format: "number" as const,
      icon: Users,
      color: "text-orange-600 bg-orange-500/10",
    },
    {
      label: "Reservas Hoje",
      value: stats?.reservationsToday ?? 0,
      format: "number" as const,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Pedidos Hoje",
      value: stats?.ordersToday ?? 0,
      format: "number" as const,
      icon: UtensilsCrossed,
      color: "text-green-600 bg-green-500/10",
    },
    {
      label: "Receita do Mes",
      value: stats?.revenueMonth ?? 0,
      format: "currency" as const,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM</h1>
        <p className="text-muted-foreground">Gestao de clientes, reservas, pedidos e cardapio</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stat.format === "currency"
                        ? `R$ ${stat.value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : stat.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crmModules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className={`p-2.5 rounded-xl w-fit mb-3 ${mod.color}`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">{mod.title}</h3>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                  Abrir <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
