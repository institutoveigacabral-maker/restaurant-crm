"use client";

import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const automations = [
  {
    name: "Confirmacao de Reserva",
    type: "WhatsApp + Email",
    status: "Mes 3",
    description: "Confirma reserva automaticamente apos criacao",
  },
  {
    name: "Lembrete Pre-Reserva",
    type: "WhatsApp",
    status: "Mes 3",
    description: "Lembrete 2h antes da reserva",
  },
  {
    name: "Pos-Visita",
    type: "Email + WhatsApp",
    status: "Mes 4",
    description: "Agradecimento + pesquisa de satisfacao",
  },
  {
    name: "Reativacao de Cliente",
    type: "Email",
    status: "Mes 4",
    description: "Cliente inativo ha 30+ dias recebe oferta",
  },
  {
    name: "Aniversario",
    type: "WhatsApp",
    status: "Mes 4",
    description: "Mensagem personalizada + voucher no aniversario",
  },
  {
    name: "Relatorio Semanal",
    type: "Email",
    status: "Mes 3",
    description: "KPIs da semana enviados ao gestor",
  },
];

export default function AutomacoesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automacoes</h1>
        <p className="text-muted-foreground">Fluxos automatizados de comunicacao e operacao</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((auto) => (
          <Card key={auto.name} className="opacity-70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-yellow-500/10 p-2.5 rounded-xl">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {auto.type}
                  </Badge>
                  <Badge variant="secondary">{auto.status}</Badge>
                </div>
              </div>
              <h3 className="font-semibold">{auto.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{auto.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
