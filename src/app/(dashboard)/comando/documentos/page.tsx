"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, FileText } from "lucide-react";

interface Document {
  id: number;
  name: string;
  type: string;
  url: string | null;
  createdAt: string;
}

const typeBadgeVariants: Record<string, { label: string; className: string }> = {
  manual: { label: "Manual", className: "bg-blue-100 text-blue-800" },
  template: { label: "Template", className: "bg-purple-100 text-purple-800" },
  policy: { label: "Policy", className: "bg-amber-100 text-amber-800" },
  checklist: { label: "Checklist", className: "bg-green-100 text-green-800" },
  other: { label: "Outro", className: "bg-gray-100 text-gray-800" },
};

export default function DocumentosPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDocuments(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/comando")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">Documentos</h1>
        </div>
        <Button onClick={() => router.push("/comando/documentos/novo")}>
          <Plus className="w-4 h-4 mr-2" />
          Novo documento
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione manuais, templates, policies e checklists da operacao.
            </p>
            <Button onClick={() => router.push("/comando/documentos/novo")}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {documents.length} documento{documents.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {documents.map((doc) => {
                const badge = typeBadgeVariants[doc.type] ?? typeBadgeVariants.other;
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 px-2 rounded"
                    onClick={() => router.push(`/comando/documentos/${doc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
