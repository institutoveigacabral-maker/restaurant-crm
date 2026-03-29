"use client";

import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  Users,
  Bot,
  Zap,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modulos = [
  {
    slug: "diagnostico",
    titulo: "Diagnostico",
    descricao: "Como avaliar a maturidade do seu negocio",
    icon: ClipboardCheck,
  },
  {
    slug: "sops",
    titulo: "Comando / SOPs",
    descricao: "Como criar e gerir procedimentos operacionais",
    icon: FileText,
  },
  {
    slug: "crm",
    titulo: "CRM",
    descricao: "Como gerir clientes, reservas e pedidos",
    icon: Users,
  },
  {
    slug: "clones",
    titulo: "Clones",
    descricao: "Como usar os assistentes IA por departamento",
    icon: Bot,
  },
  {
    slug: "automacoes",
    titulo: "Automacoes",
    descricao: "Como configurar acoes automaticas",
    icon: Zap,
  },
  {
    slug: "fidelidade",
    titulo: "Receitas / Fidelidade",
    descricao: "Como gerir o programa de pontos",
    icon: TrendingUp,
  },
  {
    slug: "dashboard",
    titulo: "Dashboard",
    descricao: "Como ler as metricas e KPIs",
    icon: BarChart3,
  },
];

export default function AjudaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Ajuda</h1>
        <p className="text-muted-foreground mt-2">
          Guias praticos para cada modulo da plataforma Nexial Rede Neural.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((modulo) => (
          <Link key={modulo.slug} href={`/ajuda/${modulo.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg">
                    <modulo.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{modulo.titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {modulo.descricao}
                </CardDescription>
                <div className="flex items-center gap-1 mt-4 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver guia <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
