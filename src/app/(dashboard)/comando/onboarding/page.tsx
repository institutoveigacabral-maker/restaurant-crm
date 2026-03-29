"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Users, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("all");
  const [newItems, setNewItems] = useState<ChecklistItem[]>([{ text: "", description: "" }]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding");
      if (!res.ok) return;
      const data = await res.json();
      const lists: Checklist[] = data.data || [];
      setChecklists(lists);

      const progressEntries: Record<number, Progress> = {};
      await Promise.all(
        lists.map(async (cl) => {
          const pRes = await fetch(`/api/onboarding/${cl.id}/progress`);
          if (pRes.ok) {
            const pData = await pRes.json();
            progressEntries[cl.id] = pData.data || { completedItems: [], completedAt: null };
          }
        })
      );
      setProgressMap(progressEntries);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function addItem() {
    setNewItems([...newItems, { text: "", description: "" }]);
  }

  function removeItem(index: number) {
    if (newItems.length <= 1) return;
    setNewItems(newItems.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: "text" | "description", value: string) {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  }

  async function handleCreate() {
    const validItems = newItems.filter((i) => i.text.trim().length > 0);
    if (newTitle.trim().length < 3 || validItems.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          role: newRole,
          items: validItems.map((i) => ({
            text: i.text.trim(),
            ...(i.description?.trim() ? { description: i.description.trim() } : {}),
          })),
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setNewTitle("");
        setNewRole("all");
        setNewItems([{ text: "", description: "" }]);
        fetchData();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  function getProgress(checklist: Checklist): { completed: number; total: number; pct: number } {
    const total = checklist.items.length;
    const progress = progressMap[checklist.id];
    const completed = progress?.completedItems?.length ?? 0;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding</h1>
          <p className="text-muted-foreground">Checklists de integracao para novos colaboradores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" />
            Nova checklist
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova checklist de onboarding</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Titulo</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Onboarding Cozinha"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Perfil</label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v ?? "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Items</label>
                <div className="space-y-3">
                  {newItems.map((item, i) => (
                    <div key={i} className="space-y-1 p-3 bg-muted/30 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          value={item.text}
                          onChange={(e) => updateItem(i, "text", e.target.value)}
                          placeholder={`Item ${i + 1}`}
                          className="flex-1"
                        />
                        {newItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(i)}
                            className="shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={item.description || ""}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        placeholder="Descricao (opcional)"
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar item
                </Button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={saving || newTitle.trim().length < 3}
                  className="flex-1"
                >
                  Criar checklist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{checklists.length}</p>
              <p className="text-xs text-muted-foreground">Checklists</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{checklists.filter((c) => c.active).length}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {checklists.reduce((sum, c) => sum + c.items.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Items total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : checklists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhuma checklist criada</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Crie checklists para guiar o onboarding de novos colaboradores
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira checklist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {checklists.map((checklist) => {
            const { completed, total, pct } = getProgress(checklist);
            return (
              <Link key={checklist.id} href={`/comando/onboarding/${checklist.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ClipboardList className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{checklist.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabel[checklist.role || "all"] || checklist.role} · {total} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Progress bar */}
                    <div className="w-24 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {completed}/{total}
                      </span>
                    </div>
                    <Badge variant={checklist.active ? "default" : "outline"}>
                      {checklist.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
