"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const sections = [
  {
    title: "Ferramentas Digitais",
    key: "ferramentas",
    questions: [
      "Utilizam software de gestao (POS, ERP)?",
      "Equipa usa email corporativo?",
      "Existe sistema de reservas digital?",
      "Usam redes sociais de forma estruturada?",
    ],
  },
  {
    title: "Dados Estruturados",
    key: "dados",
    questions: [
      "Tem base de dados de clientes?",
      "Dados de vendas sao rastreados digitalmente?",
      "Historico de reservas e mantido?",
      "Fichas tecnicas de pratos estao documentadas?",
    ],
  },
  {
    title: "Processos Documentados",
    key: "processos",
    questions: [
      "Existem SOPs escritos?",
      "Ha checklists de abertura/fecho?",
      "Processos de atendimento sao padronizados?",
      "Existe manual de onboarding?",
    ],
  },
  {
    title: "Cultura Digital",
    key: "cultura",
    questions: [
      "Equipa esta confortavel com tecnologia?",
      "Ha resistencia a novas ferramentas?",
      "Gestao ve valor em digitalizacao?",
      "Existe alguem responsavel por tech?",
    ],
  },
  {
    title: "Automacao",
    key: "automacao",
    questions: [
      "Algum processo e automatizado?",
      "Usam ferramentas de email marketing?",
      "Reservas tem confirmacao automatica?",
      "Relatorios sao gerados automaticamente?",
    ],
  },
  {
    title: "Presenca Online",
    key: "presenca",
    questions: [
      "Website atualizado e funcional?",
      "Google My Business configurado?",
      "Avaliacoes online sao respondidas?",
      "Cardapio disponivel online?",
    ],
  },
];

type Answers = Record<string, number[]>;

export default function NovoDiagnosticoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [step, setStep] = useState(0); // 0 = title, 1-6 = sections, 7 = result
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);

  const currentSection = sections[step - 1];
  const totalSteps = sections.length + 2; // title + sections + result

  function setAnswer(sectionKey: string, questionIndex: number, value: number) {
    setAnswers((prev) => {
      const sectionAnswers = [...(prev[sectionKey] || new Array(4).fill(0))];
      sectionAnswers[questionIndex] = value;
      return { ...prev, [sectionKey]: sectionAnswers };
    });
  }

  function getSectionScore(key: string): number {
    const sectionAnswers = answers[key] || [];
    const sum = sectionAnswers.reduce((a, b) => a + b, 0);
    return sum;
  }

  function getOverallScore(): number {
    return sections.reduce((total, s) => total + getSectionScore(s.key), 0);
  }

  function getRadarData() {
    return sections.map((s) => ({
      area: s.title.split(" ").slice(0, 2).join(" "),
      score: getSectionScore(s.key),
      max: 12,
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const scores: Record<string, number> = {};
      sections.forEach((s) => {
        scores[s.key] = getSectionScore(s.key);
      });

      const res = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Diagnostico " + new Date().toLocaleDateString("pt-PT"),
          answers,
          scores,
          overallScore: getOverallScore(),
          status: "completed",
        }),
      });

      if (res.ok) {
        router.push("/diagnostico");
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  const scoreLabels = ["Inexistente", "Basico", "Funcional", "Maduro"];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {step + 1}/{totalSteps}
        </span>
      </div>

      {/* Step 0: Title */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Diagnostico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do diagnostico</label>
              <Input
                placeholder="Ex: Diagnostico inicial Grupo Pateo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Button onClick={() => setStep(1)} className="w-full">
              Iniciar anamnese
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Steps 1-6: Sections */}
      {step >= 1 && step <= sections.length && currentSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentSection.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Avalie cada item de 0 (inexistente) a 3 (maduro)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSection.questions.map((q, qi) => {
              const value = (answers[currentSection.key] || [])[qi] || 0;
              return (
                <div key={qi} className="space-y-2">
                  <p className="text-sm font-medium">{q}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((v) => (
                      <Button
                        key={v}
                        variant={value === v ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setAnswer(currentSection.key, qi, v)}
                      >
                        {v} - {scoreLabels[v]}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
            <Button onClick={() => setStep(step + 1)} className="w-full">
              {step < sections.length ? "Proximo" : "Ver resultado"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Result */}
      {step === sections.length + 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultado do Diagnostico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-5xl font-bold">{getOverallScore()}</p>
                <p className="text-muted-foreground">de 72 pontos</p>
                <p className="text-sm mt-2">
                  Score de Maturidade Digital:{" "}
                  <span className="font-semibold">
                    {getOverallScore() <= 18
                      ? "Inicial"
                      : getOverallScore() <= 36
                        ? "Em desenvolvimento"
                        : getOverallScore() <= 54
                          ? "Funcional"
                          : "Maduro"}
                  </span>
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="area" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 12]} />
                    <Radar
                      dataKey="score"
                      stroke="oklch(0.65 0.17 41)"
                      fill="oklch(0.65 0.17 41)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scores by section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento por area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.map((s) => {
                const score = getSectionScore(s.key);
                const pct = (score / 12) * 100;
                return (
                  <div key={s.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.title}</span>
                      <span className="font-medium">{score}/12</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            <Check className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar diagnostico"}
          </Button>
        </div>
      )}
    </div>
  );
}
