"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChecklistItem {
  text: string;
  description?: string;
}

interface Checklist {
  id: number;
  title: string;
  role: string | null;
  items: ChecklistItem[];
  active: boolean;
  createdAt: string;
}

interface Progress {
  completedItems: number[];
  completedAt: string | null;
}

const roleLabel: Record<string, string> = {
  manager: "Manager",
  staff: "Staff",
  all: "Todos",
};

export default function ChecklistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [progress, setProgress] = useState<Progress>({ completedItems: [], completedAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [clRes, pRes] = await Promise.all([
          fetch(`/api/onboarding/${params.id}`),
          fetch(`/api/onboarding/${params.id}/progress`),
        ]);

        if (!clRes.ok) {
          setError(clRes.status === 404 ? "Checklist nao encontrada" : "Erro ao carregar");
          return;
        }

        const clData = await clRes.json();
        setChecklist(clData.data || clData);

        if (pRes.ok) {
          const pData = await pRes.json();
          setProgress(pData.data || { completedItems: [], completedAt: null });
        }
      } catch {
        setError("Erro de conexao");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function toggleItem(index: number) {
    if (!checklist || saving) return;

    const current = progress.completedItems || [];
    const updated = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index];

    setSaving(true);
    try {
      const res = await fetch(`/api/onboarding/${params.id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedItems: updated }),
      });

      if (res.ok) {
        const data = await res.json();
        setProgress(data.data || { completedItems: updated, completedAt: null });
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">{error || "Checklist nao encontrada"}</h3>
            <Button
              variant="outline"
              onClick={() => router.push("/comando/onboarding")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items: ChecklistItem[] = checklist.items || [];
  const completed = progress.completedItems || [];
  const total = items.length;
  const completedCount = completed.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allDone = completedCount >= total && total > 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/comando/onboarding")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {roleLabel[checklist.role || "all"] || checklist.role} · {total} items
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allDone && <Badge className="bg-green-600">Concluido</Badge>}
          <Badge variant={checklist.active ? "default" : "outline"}>
            {checklist.active ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{total} ({pct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allDone ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items da checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {items.map((item, index) => {
            const isCompleted = completed.includes(index);
            return (
              <button
                key={index}
                onClick={() => toggleItem(index)}
                disabled={saving}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  isCompleted
                    ? "bg-green-500/5 hover:bg-green-500/10"
                    : "bg-muted/30 hover:bg-muted/60"
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {isCompleted && <Check className="w-3 h-3" />}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
