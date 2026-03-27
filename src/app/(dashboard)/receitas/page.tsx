"use client";

import { TrendingUp, ShoppingCart, Truck, Heart, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const channels = [
  {
    name: "E-commerce",
    icon: ShoppingCart,
    status: "Mes 4",
    description: "Loja online: vouchers, kits, merchandising, gift cards",
  },
  {
    name: "Delivery Proprio",
    icon: Truck,
    status: "Mes 4",
    description: "Cardapio online + pedido direto sem comissao de plataforma",
  },
  {
    name: "Fidelidade",
    icon: Heart,
    status: "Mes 4",
    description: "Programa de pontos, niveis, recompensas, gamificacao",
  },
  {
    name: "Brindes Personalizados",
    icon: Gift,
    status: "Mes 4",
    description: "Farm Lab 3D: prototipos e producao de brindes exclusivos",
  },
];

export default function ReceitasPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novas Receitas</h1>
        <p className="text-muted-foreground">
          Canais de monetizacao e fontes de receita adicionais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <Card key={ch.name} className="opacity-70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-pink-500/10 p-2.5 rounded-xl">
                  <ch.icon className="w-5 h-5 text-pink-600" />
                </div>
                <Badge variant="secondary">{ch.status}</Badge>
              </div>
              <h3 className="font-semibold">{ch.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{ch.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
