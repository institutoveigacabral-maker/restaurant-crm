"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  Users,
  Bot,
  Zap,
  BarChart3,
  ArrowRight,
  Brain,
  CalendarCheck,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HubStats {
  totalCustomers: number;
  publishedSops: number;
  lastDiagnosticScore: number | null;
  reservationsToday: number;
}

interface SopItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface Module {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "coming";
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const modules: Module[] = [
  {
    href: "/diagnostico",
    title: "Diagnostico",
    description: "Anamnese do negocio, score de maturidade, radar chart",
    icon: ClipboardCheck,
    status: "active",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    href: "/comando",
    title: "Comando",
    description: "SOPs, documentos, onboarding de equipa",
    icon: FileText,
    status: "active",
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    href: "/crm",
    title: "CRM",
    description: "Clientes, reservas, pedidos, cardapio",
    icon: Users,
    status: "active",
    color: "text-orange-600 bg-orange-500/10",
  },
  {
    href: "/clones",
    title: "Clones Cognitivos",
    description: "Agentes IA por departamento",
    icon: Bot,
    status: "coming",
    color: "text-purple-600 bg-purple-500/10",
  },
  {
    href: "/automacoes",
    title: "Automacoes",
    description: "WhatsApp, triggers, follow-up",
    icon: Zap,
    status: "coming",
    color: "text-yellow-600 bg-yellow-500/10",
  },
  {
    href: "/dashboard",
    title: "Dashboard Executivo",
    description: "KPIs consolidados, ROI, metricas",
    icon: BarChart3,
    status: "active",
    color: "text-cyan-600 bg-cyan-500/10",
  },
];

const statusConfig = {
  active: { label: "Ativo", variant: "default" as const },
  coming: { label: "Em breve", variant: "secondary" as const },
};

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
          <div className="h-10 w-10 bg-muted rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function SopListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchHubData(): Promise<{
  stats: HubStats;
  recentSops: SopItem[];
}> {
  const today = new Date().toISOString().split("T")[0];

  const [customersRes, sopsRes, diagnosticsRes, reservationsRes] = await Promise.all([
    fetch("/api/customers")
      .then((r) => r.json())
      .catch(() => ({ success: false, data: [] })),
    fetch("/api/sops")
      .then((r) => r.json())
      .catch(() => ({ success: false, data: [] })),
    fetch("/api/diagnostics")
      .then((r) => r.json())
      .catch(() => ({ success: false, data: [] })),
    fetch("/api/reservations")
      .then((r) => r.json())
      .catch(() => ({ success: false, data: [] })),
  ]);

  const customers = customersRes.success ? customersRes.data : [];
  const sops = sopsRes.success ? sopsRes.data : [];
  const diagnostics = diagnosticsRes.success ? diagnosticsRes.data : [];
  const reservations = reservationsRes.success ? reservationsRes.data : [];

  const publishedSops = sops.filter((s: { status?: string }) => s.status === "published");

  const sortedDiagnostics = [...diagnostics].sort(
    (a: { createdAt?: string }, b: { createdAt?: string }) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const todayReservations = reservations.filter((r: { date?: string }) => {
    if (!r.date) return false;
    const rDate = new Date(r.date).toISOString().split("T")[0];
    return rDate === today;
  });

  const recentSops = [...sops]
    .sort(
      (a: { updatedAt?: string }, b: { updatedAt?: string }) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
    )
    .slice(0, 3)
    .map((s: { id?: string; title?: string; status?: string; updatedAt?: string }) => ({
      id: s.id ?? "",
      title: s.title ?? "Sem titulo",
      status: s.status ?? "draft",
      updatedAt: s.updatedAt ?? "",
    }));

  return {
    stats: {
      totalCustomers: customers.length,
      publishedSops: publishedSops.length,
      lastDiagnosticScore:
        sortedDiagnostics.length > 0
          ? ((sortedDiagnostics[0] as { score?: number }).score ?? null)
          : null,
      reservationsToday: todayReservations.length,
    },
    recentSops,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HubPage() {
  const { data: session } = useSession();
  const tenantName = (session?.user as Record<string, unknown>)?.tenantName as string;

  const [stats, setStats] = useState<HubStats | null>(null);
  const [recentSops, setRecentSops] = useState<SopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHubData()
      .then(({ stats: s, recentSops: rs }) => {
        setStats(s);
        setRecentSops(rs);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-orange-600 bg-orange-500/10",
    },
    {
      label: "SOPs publicados",
      value: stats?.publishedSops ?? 0,
      icon: FileText,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Ultimo diagnostico",
      value: stats?.lastDiagnosticScore != null ? `${stats.lastDiagnosticScore}%` : "--",
      icon: Activity,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Reservas hoje",
      value: stats?.reservationsToday ?? 0,
      icon: CalendarCheck,
      color: "text-cyan-600 bg-cyan-500/10",
    },
  ];

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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((sc) => (
              <Card key={sc.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{sc.label}</p>
                      <p className="text-2xl font-bold mt-1">{sc.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${sc.color}`}>
                      <sc.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Acesso rapido */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acesso rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
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
      </div>

      {/* Ultimos SOPs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ultimos SOPs</h2>
          <Link
            href="/comando"
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <SopListSkeleton />
        ) : recentSops.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum SOP criado ainda.{" "}
              <Link href="/comando" className="text-primary hover:underline">
                Criar primeiro SOP
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSops.map((sop) => (
              <Link key={sop.id} href="/comando">
                <Card className="hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-blue-600 bg-blue-500/10">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sop.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {sop.updatedAt
                            ? new Date(sop.updatedAt).toLocaleDateString("pt-PT", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={sop.status === "published" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {sop.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground">Modulos ativos:</span>{" "}
              <span className="font-semibold">
                {modules.filter((m) => m.status === "active").length}/{modules.length}
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
