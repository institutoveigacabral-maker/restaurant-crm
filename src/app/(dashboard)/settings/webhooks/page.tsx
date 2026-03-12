"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  fetchWebhookLogs,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Webhook,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const AVAILABLE_EVENTS = [
  { value: "customer.created", label: "Cliente criado" },
  { value: "customer.updated", label: "Cliente atualizado" },
  { value: "reservation.created", label: "Reserva criada" },
  { value: "reservation.updated", label: "Reserva atualizada" },
  { value: "order.created", label: "Pedido criado" },
  { value: "order.status_changed", label: "Status do pedido alterado" },
];

interface WebhookData {
  id: number;
  name: string;
  url: string;
  secret: string | null;
  events: string[] | null;
  active: boolean;
  created_at: string;
}

interface WebhookLogData {
  id: number;
  webhook_id: number;
  event: string;
  payload: Record<string, unknown>;
  status_code: number | null;
  response: string | null;
  success: boolean;
  created_at: string;
}

function WebhookForm({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: WebhookData;
  onSubmit: (data: { name: string; url: string; events: string[] }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [events, setEvents] = useState<string[]>(initial?.events ?? []);
  const [loading, setLoading] = useState(false);

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, url, events });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-name">Nome</Label>
        <Input
          id="webhook-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Integração ERP"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="webhook-url">URL</Label>
        <Input
          id="webhook-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com/webhook"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Eventos</Label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_EVENTS.map((evt) => (
            <label key={evt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={events.includes(evt.value)}
                onChange={() => toggleEvent(evt.value)}
                className="rounded border-border"
              />
              {evt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : initial ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}

function WebhookLogsList({ webhookId }: { webhookId: number }) {
  const [logs, setLogs] = useState<WebhookLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhookLogs(webhookId)
      .then((data) => setLogs(data as unknown as WebhookLogData[]))
      .finally(() => setLoading(false));
  }, [webhookId]);

  if (loading) return <p className="text-sm text-muted-foreground py-2">Carregando logs...</p>;
  if (logs.length === 0)
    return <p className="text-sm text-muted-foreground py-2">Nenhum log encontrado.</p>;

  return (
    <div className="space-y-2 mt-3">
      <h4 className="text-sm font-medium">Logs recentes</h4>
      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 text-xs border rounded px-3 py-2">
            {log.success ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            )}
            <Badge variant="outline" className="text-xs">
              {log.event}
            </Badge>
            <span className="text-muted-foreground">
              {log.status_code ? `HTTP ${log.status_code}` : "Erro"}
            </span>
            <span className="text-muted-foreground ml-auto">
              {log.created_at ? new Date(log.created_at).toLocaleString("pt-BR") : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  const [webhooksList, setWebhooksList] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WebhookData | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWebhooks();
      setWebhooksList(data as unknown as WebhookData[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: { name: string; url: string; events: string[] }) {
    await createWebhook(data);
    await load();
  }

  async function handleUpdate(data: { name: string; url: string; events: string[] }) {
    if (!editing) return;
    await updateWebhook({ id: editing.id, ...data });
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este webhook?")) return;
    await deleteWebhook(id);
    await load();
  }

  async function handleToggleActive(webhook: WebhookData) {
    await updateWebhook({ id: webhook.id, active: !webhook.active });
    await load();
  }

  function openEdit(webhook: WebhookData) {
    setEditing(webhook);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function truncateUrl(url: string, max = 50) {
    return url.length > max ? url.slice(0, max) + "..." : url;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="w-6 h-6" />
            Webhooks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie integrações externas via webhooks
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Webhook
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
            </DialogHeader>
            <WebhookForm
              initial={editing}
              onSubmit={editing ? handleUpdate : handleCreate}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : webhooksList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Webhook className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Nenhum webhook configurado.</p>
            <p className="text-sm">Crie um webhook para integrar com sistemas externos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooksList.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{webhook.name}</CardTitle>
                    <Badge variant={webhook.active ? "default" : "secondary"}>
                      {webhook.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(webhook)}>
                      {webhook.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(webhook)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(webhook.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-mono">
                  {truncateUrl(webhook.url)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(webhook.events ?? []).map((event) => {
                    const label = AVAILABLE_EVENTS.find((e) => e.value === event)?.label ?? event;
                    return (
                      <Badge key={event} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-muted-foreground"
                  onClick={() => setExpandedId(expandedId === webhook.id ? null : webhook.id)}
                >
                  {expandedId === webhook.id ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 mr-1" />
                      Ocultar logs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 mr-1" />
                      Ver logs recentes
                    </>
                  )}
                </Button>

                {expandedId === webhook.id && <WebhookLogsList webhookId={webhook.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
