"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, BookOpen, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Sop {
  id: number;
  title: string;
  category: string;
  status: string;
  version: number;
  updatedAt: string;
}

const categoryLabel: Record<string, string> = {
  salao: "Salao",
  cozinha: "Cozinha",
  financeiro: "Financeiro",
  rh: "RH",
  marketing: "Marketing",
  delivery: "Delivery",
};

export default function ComandoPage() {
  const [sops, setSops] = useState<Sop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sops")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => setSops(res.data || []))
      .catch(() => setSops([]))
      .finally(() => setLoading(false));
  }, []);

  const published = sops.filter((s) => s.status === "published");
  const drafts = sops.filter((s) => s.status === "draft");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comando</h1>
          <p className="text-muted-foreground">Base de conhecimento, SOPs e documentos</p>
        </div>
        <Link href="/comando/sops/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo SOP
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sops.length}</p>
              <p className="text-xs text-muted-foreground">SOPs total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{published.length}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2.5 rounded-xl">
              <CheckSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drafts.length}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhum SOP criado</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Documente os processos operacionais do negocio
            </p>
            <Link href="/comando/sops/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro SOP
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos ({sops.length})</TabsTrigger>
            <TabsTrigger value="published">Publicados ({published.length})</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos ({drafts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-2">
            {sops.map((sop) => (
              <SopRow key={sop.id} sop={sop} />
            ))}
          </TabsContent>
          <TabsContent value="published" className="mt-4 space-y-2">
            {published.map((sop) => (
              <SopRow key={sop.id} sop={sop} />
            ))}
          </TabsContent>
          <TabsContent value="draft" className="mt-4 space-y-2">
            {drafts.map((sop) => (
              <SopRow key={sop.id} sop={sop} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function SopRow({ sop }: { sop: Sop }) {
  return (
    <Link href={`/comando/sops/${sop.id}`}>
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{sop.title}</p>
            <p className="text-xs text-muted-foreground">
              {categoryLabel[sop.category] || sop.category} · v{sop.version}
            </p>
          </div>
        </div>
        <Badge variant={sop.status === "published" ? "default" : "outline"}>
          {sop.status === "published" ? "Publicado" : "Rascunho"}
        </Badge>
      </div>
    </Link>
  );
}
