"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { guias } from "@/data/guias-ajuda";

export default function GuiaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const guia = guias[slug];
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!guia) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const secao of guia.secoes) {
      const el = sectionRefs.current[secao.id];
      if (el) observer.observe(el);
    }
    const dicasEl = sectionRefs.current["dicas"];
    if (dicasEl) observer.observe(dicasEl);
    const faqEl = sectionRefs.current["faq"];
    if (faqEl) observer.observe(faqEl);

    return () => observer.disconnect();
  }, [guia]);

  if (!guia) {
    return (
      <div className="space-y-4">
        <Link href="/ajuda">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <p className="text-muted-foreground">Guia nao encontrado.</p>
      </div>
    );
  }

  const allSections = [
    ...guia.secoes.map((s) => ({ id: s.id, titulo: s.titulo })),
    { id: "dicas", titulo: "Dicas" },
    { id: "faq", titulo: "Perguntas Frequentes" },
  ];

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar / Indice */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-6 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Indice
          </p>
          {allSections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-2 w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                activeSection === s.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <ChevronRight
                className={`w-3 h-3 shrink-0 transition-transform ${
                  activeSection === s.id ? "rotate-90" : ""
                }`}
              />
              <span className="truncate">{s.titulo}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Conteudo */}
      <div className="flex-1 min-w-0 space-y-8">
        <div>
          <Link href="/ajuda">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar a Central de Ajuda
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{guia.titulo}</h1>
          <p className="text-muted-foreground mt-2">{guia.descricao}</p>
        </div>

        {/* Passos */}
        {guia.secoes.map((secao) => (
          <section
            key={secao.id}
            id={secao.id}
            ref={(el) => {
              sectionRefs.current[secao.id] = el;
            }}
            className="scroll-mt-6"
          >
            <h2 className="text-xl font-semibold mb-3">{secao.titulo}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed">{secao.conteudo}</div>
          </section>
        ))}

        {/* Dicas */}
        <section
          id="dicas"
          ref={(el) => {
            sectionRefs.current["dicas"] = el;
          }}
          className="scroll-mt-6"
        >
          <h2 className="text-xl font-semibold mb-3">Dicas</h2>
          <div className="space-y-2">
            {guia.dicas.map((dica, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  Dica {i + 1}
                </Badge>
                <p className="text-sm text-muted-foreground">{dica.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          ref={(el) => {
            sectionRefs.current["faq"] = el;
          }}
          className="scroll-mt-6"
        >
          <h2 className="text-xl font-semibold mb-3">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {guia.faq.map((item, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="text-sm font-medium">{item.pergunta}</p>
                <p className="text-sm text-muted-foreground mt-2">{item.resposta}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
