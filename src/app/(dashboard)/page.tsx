"use client";

import { useSession } from "next-auth/react";
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
  Brain,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Module {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "coming" | "setup";
  color: string;
}

const modules: Module[] = [
  {
    href: "/diagnostico",
    title: "Diagnostico",
    description: "Anamnese do negocio, score de maturidade digital, relatorio de oportunidades",
    icon: ClipboardCheck,
    status: "active",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    href: "/comando",
    title: "Comando",
    description: "SOPs, base de conhecimento, documentos, onboarding de equipa",
    icon: FileText,
    status: "active",
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    href: "/crm",
    title: "CRM",
    description: "Clientes, reservas, pedidos, cardapio, fidelidade",
    icon: Users,
    status: "active",
    color: "text-orange-600 bg-orange-500/10",
  },
  {
    href: "/clones",
    title: "Clones Cognitivos",
    description: "Agentes IA por departamento: atendimento, operacao, marketing, financeiro",
    icon: Bot,
    status: "coming",
    color: "text-purple-600 bg-purple-500/10",
  },
  {
    href: "/automacoes",
    title: "Automacoes",
    description: "WhatsApp, reservas automaticas, fluxos de follow-up, triggers",
    icon: Zap,
    status: "coming",
    color: "text-yellow-600 bg-yellow-500/10",
  },
  {
    href: "/receitas",
    title: "Receitas",
    description: "E-commerce, delivery proprio, programa de fidelidade, upsell",
    icon: TrendingUp,
    status: "coming",
    color: "text-pink-600 bg-pink-500/10",
  },
  {
    href: "/dashboard",
    title: "Dashboard Executivo",
    description: "KPIs consolidados, ROI, metricas por marca, visao do grupo",
    icon: BarChart3,
    status: "active",
    color: "text-cyan-600 bg-cyan-500/10",
  },
];

const statusConfig = {
  active: { label: "Ativo", variant: "default" as const },
  coming: { label: "Em breve", variant: "secondary" as const },
  setup: { label: "Configurar", variant: "outline" as const },
};

export default function HubPage() {
  const { data: session } = useSession();
  const tenantName = (session?.user as Record<string, unknown>)?.tenantName as string;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nexial Rede Neural</h1>
            {tenantName && <p className="text-muted-foreground">{tenantName}</p>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
          Plataforma de inteligencia operacional. Cada modulo e uma camada do sistema nervoso
          digital do seu negocio.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const status = statusConfig[mod.status];
          const isActive = mod.status === "active";
          return (
            <Link key={mod.href} href={isActive ? mod.href : "#"}>
              <Card
                className={`h-full transition-all ${
                  isActive
                    ? "hover:shadow-md hover:border-primary/30 cursor-pointer"
                    : "opacity-60 cursor-default"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${mod.color}`}>
                      <mod.icon className="w-5 h-5" />
                    </div>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                  {isActive && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                      Abrir <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground">Modulos ativos:</span>{" "}
              <span className="font-semibold">
                {modules.filter((m) => m.status === "active").length}/7
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Fase:</span>{" "}
              <span className="font-semibold">Fundacao</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Nexial Rede Neural v1.0</p>
        </div>
      </div>
    </div>
  );
}
