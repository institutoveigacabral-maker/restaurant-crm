"use client";

import Link from "next/link";
import { Users, CalendarDays, UtensilsCrossed, BookOpen, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM</h1>
        <p className="text-muted-foreground">Gestao de clientes, reservas, pedidos e cardapio</p>
      </div>

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
