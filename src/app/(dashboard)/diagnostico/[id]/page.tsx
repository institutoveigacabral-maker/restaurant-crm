"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Target } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const sectionLabels: Record<string, string> = {
  ferramentas: "Ferramentas Digitais",
  dados: "Dados Estruturados",
  processos: "Processos Documentados",
  cultura: "Cultura Digital",
  automacao: "Automacao",
  presenca: "Presenca Online",
};

const maturityLevel = (score: number) => {
  if (score >= 54) return { label: "Maduro", color: "text-green-600" };
  if (score >= 36) return { label: "Funcional", color: "text-blue-600" };
  if (score >= 18) return { label: "Em desenvolvimento", color: "text-yellow-600" };
  return { label: "Inicial", color: "text-red-600" };
};

interface DiagnosticDetail {
  id: number;
  title: string;
  status: string;
  overallScore: number | null;
  scores: Record<string, number> | null;
  answers: Record<string, number[]> | null;
  createdAt: string;
  completedAt: string | null;
}

export default function DiagnosticoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [diagnostic, setDiagnostic] = useState<DiagnosticDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/diagnostics/${params.id}`)
      .then((r) => {
        if (!r.ok)
          throw new Error(r.status === 404 ? "Diagnostico nao encontrado" : "Erro ao carregar");
        return r.json();
      })
      .then((data) => setDiagnostic(data.data || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">{error || "Diagnostico nao encontrado"}</h3>
            <Button variant="outline" onClick={() => router.push("/diagnostico")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scores = diagnostic.scores || {};
  const overall = diagnostic.overallScore || 0;
  const maturity = maturityLevel(overall);

  const radarData = Object.entries(sectionLabels).map(([key, label]) => ({
    area: label.split(" ").slice(0, 2).join(" "),
    score: scores[key] || 0,
    max: 12,
  }));

  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    draft: { label: "Rascunho", variant: "outline" },
    in_progress: { label: "Em progresso", variant: "secondary" },
    completed: { label: "Concluido", variant: "default" },
  };
  const status = statusConfig[diagnostic.status] || statusConfig.draft;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/diagnostico")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{diagnostic.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(diagnostic.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Score geral */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Score de Maturidade</p>
              <p className="text-5xl font-bold">
                {overall}
                <span className="text-lg text-muted-foreground">/72</span>
              </p>
              <p className={`text-sm font-medium mt-1 ${maturity.color}`}>{maturity.label}</p>
            </div>
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 12]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(sectionLabels).map(([key, label]) => {
            const score = scores[key] || 0;
            const pct = (score / 12) * 100;
            const level =
              score >= 9 ? "Maduro" : score >= 6 ? "Funcional" : score >= 3 ? "Basico" : "Inicial";
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{level}</span>
                    <span className="font-medium">{score}/12</span>
                  </div>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recomendacoes baseadas nos scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proximos passos recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {Object.entries(scores)
              .sort(([, a], [, b]) => a - b)
              .slice(0, 3)
              .map(([key, score]) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#8226;</span>
                  <span>
                    <strong>{sectionLabels[key]}</strong> ({score}/12) —{" "}
                    {score < 3
                      ? "Prioridade critica. Iniciar estruturacao basica."
                      : score < 6
                        ? "Precisa atencao. Formalizar processos existentes."
                        : "Bom progresso. Otimizar e automatizar."}
                  </span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
