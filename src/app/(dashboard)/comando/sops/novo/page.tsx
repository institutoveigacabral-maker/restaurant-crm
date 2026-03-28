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
import { ArrowLeft, Save, Send } from "lucide-react";

const categories = [
  { value: "salao", label: "Salao" },
  { value: "cozinha", label: "Cozinha" },
  { value: "financeiro", label: "Financeiro" },
  { value: "rh", label: "RH" },
  { value: "marketing", label: "Marketing" },
  { value: "delivery", label: "Delivery" },
  { value: "higiene", label: "Higiene e Seguranca" },
  { value: "atendimento", label: "Atendimento" },
];

export default function NovoSopPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(status: "draft" | "published") {
    if (!title.trim() || !category || !content.trim()) {
      setError("Preencha titulo, categoria e conteudo.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content, status }),
      });

      if (res.ok) {
        router.push("/comando");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar SOP");
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/comando")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-xl font-bold">Novo SOP</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes do procedimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Titulo</label>
            <Input
              placeholder="Ex: Checklist de abertura do restaurante"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Categoria</label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Conteudo</label>
            <Textarea
              placeholder="Descreva o procedimento passo a passo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use markdown para formatacao (titulos, listas, negrito).
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar rascunho
            </Button>
            <Button onClick={() => handleSave("published")} disabled={saving} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
