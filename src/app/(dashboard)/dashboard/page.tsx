"use client";

import { BarChart3, Users, CalendarDays, TrendingUp, FileText, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardExecutivoPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
        <p className="text-muted-foreground">Visao consolidada do grupo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-orange-500/10 p-2.5 rounded-xl">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Clientes totais</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Reservas este mes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Receita mensal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0/5</p>
              <p className="text-xs text-muted-foreground">Clones ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maturidade + Progresso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progresso da Consultoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { mes: "Mes 1 - Fundacao", pct: 0 },
              { mes: "Mes 2 - Dados + IA", pct: 0 },
              { mes: "Mes 3 - Automacao", pct: 0 },
              { mes: "Mes 4 - Receitas", pct: 0 },
              { mes: "Mes 5 - Produto", pct: 0 },
              { mes: "Mes 6 - Escala", pct: 0 },
            ].map((fase) => (
              <div key={fase.mes}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{fase.mes}</span>
                  <span className="text-muted-foreground">{fase.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${fase.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modulos da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Diagnostico", icon: FileText, status: "Ativo" },
              { name: "Comando (SOPs)", icon: FileText, status: "Ativo" },
              { name: "CRM", icon: Users, status: "Ativo" },
              { name: "Clones", icon: Bot, status: "Mes 2" },
              { name: "Automacoes", icon: BarChart3, status: "Mes 3" },
              { name: "Receitas", icon: TrendingUp, status: "Mes 4" },
              { name: "Dashboard", icon: BarChart3, status: "Ativo" },
            ].map((mod) => (
              <div key={mod.name} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <mod.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{mod.name}</span>
                </div>
                <span
                  className={`text-xs font-medium ${mod.status === "Ativo" ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {mod.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
