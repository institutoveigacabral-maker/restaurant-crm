"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardCheck, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Diagnostic {
  id: number;
  title: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Rascunho", variant: "outline" },
  in_progress: { label: "Em progresso", variant: "secondary" },
  completed: { label: "Concluido", variant: "default" },
};

export default function DiagnosticoPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/diagnostics")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => setDiagnostics(res.data || []))
      .catch(() => setDiagnostics([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diagnostico</h1>
          <p className="text-muted-foreground">Anamnese do negocio e score de maturidade digital</p>
        </div>
        <Link href="/diagnostico/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Diagnostico
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : diagnostics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhum diagnostico ainda</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Comece com uma anamnese completa do negocio
            </p>
            <Link href="/diagnostico/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro diagnostico
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnostics.map((d) => {
            const status = statusConfig[d.status] || statusConfig.draft;
            return (
              <Card key={d.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{d.title}</CardTitle>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      {d.overallScore !== null && (
                        <p className="text-2xl font-bold">{d.overallScore}/72</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Link href={`/diagnostico/${d.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
