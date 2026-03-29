"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Plus, Power, History, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUTOMATION_TYPES,
  AUTOMATION_TYPE_LABELS,
  AUTOMATION_TYPE_TRIGGERS,
  AUTOMATION_TYPE_ACTIONS,
  type AutomationType,
} from "@/lib/validations/automation";
import { toast } from "sonner";

interface Automation {
  id: number;
  tenantId: string;
  name: string;
  type: string;
  trigger: { event: string; description: string } | null;
  actions: { type: string; description: string }[] | null;
  active: boolean | null;
  executionCount: number | null;
  lastExecutedAt: string | null;
  createdAt: string | null;
}

interface AutomationLog {
  id: number;
  automationId: number;
  status: string;
  input: unknown;
  output: unknown;
  executedAt: string | null;
}

export default function AutomacoesPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<AutomationLog[]>([]);
  const [selectedAutomationName, setSelectedAutomationName] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<AutomationType | "">("");

  const fetchAutomations = useCallback(async () => {
    try {
      const res = await fetch("/api/automations");
      const json = await res.json();
      if (json.success) setAutomations(json.data);
    } catch {
      toast.error("Erro ao carregar automacoes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  async function handleCreate() {
    if (!formName.trim() || !formType) {
      toast.error("Preencha nome e tipo");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, type: formType, active: true }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Automacao criada");
        setCreateOpen(false);
        setFormName("");
        setFormType("");
        fetchAutomations();
      } else {
        toast.error(json.error || "Erro ao criar");
      }
    } catch {
      toast.error("Erro ao criar automacao");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: number) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: true }),
      });
      const json = await res.json();
      if (json.success) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, active: json.data.active } : a))
        );
      }
    } catch {
      toast.error("Erro ao alterar status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/automations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Automacao removida");
        setAutomations((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      toast.error("Erro ao remover");
    }
  }

  async function handleViewLogs(automation: Automation) {
    setSelectedAutomationName(automation.name);
    setLogsOpen(true);
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/automations/${automation.id}/logs`);
      const json = await res.json();
      if (json.success) setSelectedLogs(json.data);
    } catch {
      toast.error("Erro ao carregar logs");
    } finally {
      setLogsLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getTriggerText(automation: Automation): string {
    const trigger = automation.trigger as { description?: string } | null;
    if (trigger?.description) return trigger.description;
    const type = automation.type as AutomationType;
    return AUTOMATION_TYPE_TRIGGERS[type] ?? automation.type;
  }

  function getActionText(automation: Automation): string {
    const actions = automation.actions as { description?: string }[] | null;
    if (actions?.[0]?.description) return actions[0].description;
    const type = automation.type as AutomationType;
    return AUTOMATION_TYPE_ACTIONS[type] ?? "Acao configurada";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automacoes</h1>
          <p className="text-muted-foreground">Triggers internos que disparam acoes automaticas</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4" data-icon="inline-start" />
            Nova Automacao
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Automacao</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-name">Nome</Label>
                <Input
                  id="auto-name"
                  placeholder="Ex: Confirmar reservas automaticamente"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formType}
                  onValueChange={(val) => setFormType(val as AutomationType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {AUTOMATION_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formType && (
                <div className="rounded-lg border p-3 space-y-2 text-sm bg-muted/30">
                  <div>
                    <span className="font-medium text-muted-foreground">Trigger:</span>{" "}
                    {AUTOMATION_TYPE_TRIGGERS[formType as AutomationType]}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Acao:</span>{" "}
                    {AUTOMATION_TYPE_ACTIONS[formType as AutomationType]}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma automacao configurada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie a primeira automacao para comecar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <Card key={auto.id} className={auto.active ? "" : "opacity-60"}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-yellow-500/10 p-2.5 rounded-xl">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={auto.active ? "default" : "secondary"}>
                      {auto.active ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {AUTOMATION_TYPE_LABELS[auto.type as AutomationType] ?? auto.type}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold">{auto.name}</h3>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Trigger:</span> {getTriggerText(auto)}
                  </p>
                  <p>
                    <span className="font-medium">Acao:</span> {getActionText(auto)}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Execucoes: {auto.executionCount ?? 0}</span>
                  <span>Ultima: {formatDate(auto.lastExecutedAt)}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(auto.id)}
                    disabled={togglingId === auto.id}
                  >
                    {togglingId === auto.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" data-icon="inline-start" />
                    ) : (
                      <Power className="w-3.5 h-3.5" data-icon="inline-start" />
                    )}
                    {auto.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewLogs(auto)}>
                    <History className="w-3.5 h-3.5" data-icon="inline-start" />
                    Logs
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(auto.id)}>
                    <Trash2 className="w-3.5 h-3.5" data-icon="inline-start" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Logs */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Logs - {selectedAutomationName}</DialogTitle>
          </DialogHeader>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : selectedLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma execucao registrada
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {selectedLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border p-3 text-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={log.status === "success" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                    <span className="text-muted-foreground">{formatDate(log.executedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
