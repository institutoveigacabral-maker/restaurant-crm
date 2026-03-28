"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Save, Send, FileText } from "lucide-react";

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

const categoryLabel: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.value, c.label])
);

interface SopDetail {
  id: number;
  title: string;
  category: string;
  content: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export default function SopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sop, setSop] = useState<SopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch(`/api/sops/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "SOP nao encontrado" : "Erro ao carregar");
        return r.json();
      })
      .then((data) => {
        const s = data.data || data;
        setSop(s);
        setEditTitle(s.title);
        setEditCategory(s.category);
        setEditContent(s.content || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave(status?: "draft" | "published") {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {
        title: editTitle,
        category: editCategory,
        content: editContent,
      };
      if (status) body.status = status;

      const res = await fetch(`/api/sops/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setSop(data.data || data);
        setEditing(false);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
      }
    } catch {
      setError("Erro de conexao");
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

  if (error && !sop) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">{error}</h3>
            <Button variant="outline" onClick={() => router.push("/comando")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sop) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/comando")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      {editing ? (
        /* Edit mode */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editar SOP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titulo</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Categoria</label>
              <Select value={editCategory} onValueChange={(v) => setEditCategory(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
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
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave()}
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              {sop.status === "draft" && (
                <Button onClick={() => handleSave("published")} disabled={saving}>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* View mode */
        <>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{sop.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{categoryLabel[sop.category] || sop.category}</span>
                <span>v{sop.version}</span>
                <span>Atualizado {new Date(sop.updatedAt).toLocaleDateString("pt-PT")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={sop.status === "published" ? "default" : "outline"}>
                {sop.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {sop.content}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
