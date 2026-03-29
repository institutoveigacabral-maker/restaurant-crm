"use client";

import { useState } from "react";
import { Bot, Utensils, ChefHat, Phone, SprayCan, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CloneChat from "@/components/CloneChat";

const CLONE_CONFIGS = [
  {
    id: "salao",
    name: "Clone Salao",
    department: "salao" as const,
    description: "Procedimentos de servico, mise en place, protocolo de atendimento",
    icon: Utensils,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    id: "cozinha",
    name: "Clone Cozinha",
    department: "cozinha" as const,
    description: "Receitas, fichas tecnicas, preparacao, controle de stock",
    icon: ChefHat,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  {
    id: "atendimento",
    name: "Clone Atendimento",
    department: "atendimento" as const,
    description: "FAQ, reservas, reclamacoes, comunicacao com clientes",
    icon: Phone,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    id: "higiene",
    name: "Clone Higiene",
    department: "higiene" as const,
    description: "HACCP, limpeza, seguranca alimentar, checklists sanitarios",
    icon: SprayCan,
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  {
    id: "rh",
    name: "Clone RH",
    department: "rh" as const,
    description: "Onboarding, escalas, ferias, regulamentos internos",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
];

type Department = (typeof CLONE_CONFIGS)[number]["department"];

export default function ClonesPage() {
  const [activeClone, setActiveClone] = useState<Department | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clones Cognitivos</h1>
        <p className="text-muted-foreground">
          Agentes IA especializados por departamento, treinados com os SOPs do restaurante
        </p>
      </div>

      {/* Cards de clones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLONE_CONFIGS.map((clone) => {
          const Icon = clone.icon;
          const isActive = activeClone === clone.department;

          return (
            <Card
              key={clone.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isActive ? "ring-2 ring-purple-500 shadow-md" : ""
              }`}
              onClick={() => setActiveClone(isActive ? null : clone.department)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${clone.bg} p-2.5 rounded-xl`}>
                    <Icon className={`w-5 h-5 ${clone.color}`} />
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Ativo" : "Disponivel"}
                  </Badge>
                </div>
                <h3 className="font-semibold">{clone.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{clone.department}</p>
                <p className="text-sm text-muted-foreground">{clone.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat inline */}
      {activeClone && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">
              Chat — {CLONE_CONFIGS.find((c) => c.department === activeClone)?.name}
            </h2>
          </div>
          <CloneChat
            key={activeClone}
            initialDepartment={activeClone}
            onClose={() => setActiveClone(null)}
          />
        </div>
      )}
    </div>
  );
}
