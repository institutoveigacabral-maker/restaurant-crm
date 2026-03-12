"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HealthData {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: "healthy" | "unhealthy"; latency: number; error?: string };
    memory: { rss: number; heapUsed: number; heapTotal: number };
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = (await res.json()) as HealthData;
      setHealth(data);
      setError(null);
    } catch {
      setError("Falha ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Status do Sistema</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Status do Sistema</h1>
        <Card>
          <CardContent className="pt-6">
            <Badge variant="destructive">Indisponível</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!health) return null;

  const isHealthy = health.status === "healthy";
  const dbHealthy = health.checks.database.status === "healthy";

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Status do Sistema</h1>
        <Badge variant={isHealthy ? "default" : "destructive"}>
          {isHealthy ? "Saudável" : "Indisponível"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Banco de Dados</CardTitle>
            <CardDescription>Conectividade e latência</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={dbHealthy ? "default" : "destructive"}>
                  {dbHealthy ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Latência</span>
                <span className="text-sm font-medium">{health.checks.database.latency}ms</span>
              </div>
              {health.checks.database.error && (
                <p className="text-xs text-destructive mt-1">{health.checks.database.error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Memória</CardTitle>
            <CardDescription>Uso de memória do processo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">RSS</span>
                <span className="text-sm font-medium">{health.checks.memory.rss} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Heap Usado</span>
                <span className="text-sm font-medium">{health.checks.memory.heapUsed} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Heap Total</span>
                <span className="text-sm font-medium">{health.checks.memory.heapTotal} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sistema</CardTitle>
            <CardDescription>Informações do servidor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Versão</span>
                <span className="text-sm font-medium">{health.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Atualizado em</span>
                <span className="text-sm font-medium">
                  {new Date(health.timestamp).toLocaleTimeString("pt-BR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Atualização automática a cada 30 segundos
      </p>
    </div>
  );
}
