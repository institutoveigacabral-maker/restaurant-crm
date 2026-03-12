"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchFeatureFlags, toggleFeatureFlag } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, ToggleLeft } from "lucide-react";

interface Flag {
  id: number;
  key: string;
  enabled: boolean;
  description: string;
  created_at: string;
}

const DEFAULT_FLAGS = [
  { key: "dark_mode", enabled: true, description: "Modo escuro habilitado" },
  { key: "email_notifications", enabled: true, description: "Envio de emails transacionais" },
  { key: "webhook_integration", enabled: true, description: "Sistema de webhooks ativo" },
  { key: "pwa_enabled", enabled: true, description: "Progressive Web App habilitado" },
  { key: "advanced_analytics", enabled: true, description: "Analytics avançado habilitado" },
];

function FlagCard({
  flag,
  onToggle,
}: {
  flag: Flag;
  onToggle: (key: string, enabled: boolean) => void;
}) {
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await onToggle(flag.key, !flag.enabled);
    } finally {
      setToggling(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{flag.key}</p>
            <p className="text-xs text-muted-foreground">{flag.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={flag.enabled ? "default" : "secondary"}>
            {flag.enabled ? "Ativo" : "Inativo"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleToggle} disabled={toggling}>
            {toggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : flag.enabled ? (
              "Desativar"
            ) : (
              "Ativar"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewFlagDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (key: string, enabled: boolean, description: string) => Promise<void>;
}) {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setSaving(true);
    try {
      await onSave(key.trim(), enabled, description);
      setKey("");
      setDescription("");
      setEnabled(false);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Feature Flag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flagKey">Chave</Label>
            <Input
              id="flagKey"
              placeholder="ex: nova_funcionalidade"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flagDesc">Descrição</Label>
            <Input
              id="flagDesc"
              placeholder="Descrição da flag"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="flagEnabled"
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <Label htmlFor="flagEnabled">Habilitada</Label>
          </div>
          <Button type="submit" className="w-full" disabled={saving || !key.trim()}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Criar Flag
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadFlags = useCallback(async () => {
    try {
      const data = await fetchFeatureFlags();
      const mapped = data.map((f) => ({
        id: f.id as number,
        key: f.key as string,
        enabled: f.enabled as boolean,
        description: (f.description as string) ?? "",
        created_at: (f.created_at as string) ?? "",
      }));

      // Seed default flags if none exist
      if (mapped.length === 0) {
        for (const def of DEFAULT_FLAGS) {
          await toggleFeatureFlag(def.key, def.enabled, def.description);
        }
        const refreshed = await fetchFeatureFlags();
        setFlags(
          refreshed.map((f) => ({
            id: f.id as number,
            key: f.key as string,
            enabled: f.enabled as boolean,
            description: (f.description as string) ?? "",
            created_at: (f.created_at as string) ?? "",
          }))
        );
      } else {
        setFlags(mapped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  async function handleToggle(key: string, enabled: boolean) {
    await toggleFeatureFlag(key, enabled);
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled } : f)));
  }

  async function handleNewFlag(key: string, enabled: boolean, description: string) {
    await toggleFeatureFlag(key, enabled, description);
    const data = await fetchFeatureFlags();
    setFlags(
      data.map((f) => ({
        id: f.id as number,
        key: f.key as string,
        enabled: f.enabled as boolean,
        description: (f.description as string) ?? "",
        created_at: (f.created_at as string) ?? "",
      }))
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Flag
        </Button>
      </div>

      <div className="space-y-3">
        {flags.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-muted-foreground text-sm">
                Nenhuma flag cadastrada
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          flags.map((flag) => <FlagCard key={flag.id} flag={flag} onToggle={handleToggle} />)
        )}
      </div>

      <NewFlagDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleNewFlag} />
    </div>
  );
}
