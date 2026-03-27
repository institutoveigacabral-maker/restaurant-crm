"use client";

import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const clones = [
  {
    name: "Atendimento",
    department: "Salao",
    status: "Mes 2",
    description: "FAQ, menus, horarios, reservas via WhatsApp",
  },
  {
    name: "Operacao",
    department: "Cozinha/Gestao",
    status: "Mes 2",
    description: "SOPs, checklists, procedimentos internos",
  },
  {
    name: "Marketing",
    department: "Marketing",
    status: "Mes 3",
    description: "Copy, posts, campanhas, respostas a reviews",
  },
  {
    name: "Financeiro",
    department: "Admin",
    status: "Mes 4",
    description: "Relatorios automaticos, analise de dados",
  },
  {
    name: "Cliente Final",
    department: "Externo",
    status: "Mes 3",
    description: "Reservar mesa, consultar menu, fazer pedido",
  },
];

export default function ClonesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clones Cognitivos</h1>
        <p className="text-muted-foreground">Agentes IA especializados por departamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clones.map((clone) => (
          <Card key={clone.name} className="opacity-70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-purple-500/10 p-2.5 rounded-xl">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <Badge variant="secondary">{clone.status}</Badge>
              </div>
              <h3 className="font-semibold">{clone.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{clone.department}</p>
              <p className="text-sm text-muted-foreground">{clone.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
