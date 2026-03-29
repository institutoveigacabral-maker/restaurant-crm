"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

const documentTypes = [
  { value: "manual", label: "Manual" },
  { value: "template", label: "Template" },
  { value: "policy", label: "Policy" },
  { value: "checklist", label: "Checklist" },
  { value: "other", label: "Outro" },
];

export default function NovoDocumentoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim() || !type) {
      setError("Preencha nome e tipo.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = { name, type };
      if (url.trim()) payload.url = url;
      if (metadata.trim()) {
        try {
          payload.metadata = JSON.parse(metadata);
        } catch {
          setError("Metadata deve ser JSON valido.");
          setSaving(false);
          return;
        }
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/comando/documentos");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar documento");
      }
    } catch {
      setError("Erro de conexao");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/comando/documentos")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-xl font-bold">Novo Documento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes do documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome</label>
            <Input
              placeholder="Ex: Manual de abertura do restaurante"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo</label>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">URL (opcional)</label>
            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Metadata (opcional)</label>
            <Textarea
              placeholder='{"descricao": "...", "versao": "1.0"}'
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JSON livre para informacoes adicionais.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar documento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
