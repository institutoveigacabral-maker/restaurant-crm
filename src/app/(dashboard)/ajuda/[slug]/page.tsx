"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FAQ {
  pergunta: string;
  resposta: string;
}

interface Dica {
  texto: string;
}

interface Secao {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
}

interface Guia {
  titulo: string;
  descricao: string;
  secoes: Secao[];
  dicas: Dica[];
  faq: FAQ[];
}

const guias: Record<string, Guia> = {
  diagnostico: {
    titulo: "Diagnostico",
    descricao: "Avalie a maturidade operacional do seu negocio com um questionario estruturado.",
    secoes: [
      {
        id: "aceder",
        titulo: "1. Aceder ao modulo Diagnostico",
        conteudo: (
          <p>
            No menu lateral, clique em <strong>Diagnostico</strong> na secao Consultoria. Vera a
            lista de diagnosticos ja realizados (se houver) e o botao para criar um novo.
          </p>
        ),
      },
      {
        id: "novo",
        titulo: "2. Criar novo Diagnostico",
        conteudo: (
          <>
            <p>
              Clique em <strong>&quot;Novo Diagnostico&quot;</strong>. Preencha o titulo (ex:
              &quot;Diagnostico Q1 2026&quot;) para identificar facilmente no historico.
            </p>
          </>
        ),
      },
      {
        id: "preencher",
        titulo: "3. Preencher as 24 perguntas",
        conteudo: (
          <>
            <p>
              O questionario esta dividido em <strong>6 secoes</strong> com 4 perguntas cada. Cada
              pergunta avalia um aspecto da maturidade operacional:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gestao de Pessoas</li>
              <li>Processos Operacionais</li>
              <li>Tecnologia e Dados</li>
              <li>Experiencia do Cliente</li>
              <li>Marketing e Vendas</li>
              <li>Financeiro e Controlo</li>
            </ul>
            <p className="mt-2">Responda com honestidade para obter um score realista.</p>
          </>
        ),
      },
      {
        id: "resultado",
        titulo: "4. Ver resultado com radar chart e score",
        conteudo: (
          <p>
            Apos submeter, vera um <strong>radar chart</strong> com a pontuacao por secao e um{" "}
            <strong>score global de maturidade</strong> (0-100). O grafico mostra visualmente as
            areas fortes e as que precisam de atencao.
          </p>
        ),
      },
      {
        id: "comparar",
        titulo: "5. Comparar com diagnosticos anteriores",
        conteudo: (
          <p>
            No Dashboard, a secao <strong>Evolucao de Maturidade</strong> mostra a progressao dos
            scores ao longo do tempo. Use para medir o impacto real das acoes implementadas.
          </p>
        ),
      },
    ],
    dicas: [
      { texto: "Faca um diagnostico a cada trimestre para acompanhar a evolucao." },
      { texto: "Envolva gestores de cada area no preenchimento para respostas mais precisas." },
      {
        texto:
          "O score nao e uma nota — e um mapa. Areas com score baixo sao oportunidades de melhoria.",
      },
    ],
    faq: [
      {
        pergunta: "Posso editar um diagnostico ja submetido?",
        resposta:
          "Nao. Cada diagnostico e um snapshot do momento. Para atualizar, crie um novo diagnostico.",
      },
      {
        pergunta: "Quantos diagnosticos posso ter?",
        resposta: "Sem limite. O historico completo fica disponivel para comparacao.",
      },
      {
        pergunta: "Quem pode criar diagnosticos?",
        resposta: "Owners e Admins do tenant. Gerentes podem visualizar mas nao criar.",
      },
    ],
  },

  sops: {
    titulo: "Comando / SOPs",
    descricao: "Crie e gira procedimentos operacionais padronizados para a sua equipa.",
    secoes: [
      {
        id: "aceder",
        titulo: "1. Aceder a Comando > SOPs",
        conteudo: (
          <p>
            No menu lateral, clique em <strong>SOPs</strong> na secao Consultoria. Vera a lista de
            todos os SOPs organizados por categoria.
          </p>
        ),
      },
      {
        id: "novo",
        titulo: "2. Criar novo SOP",
        conteudo: (
          <>
            <p>
              Clique em <strong>&quot;Novo SOP&quot;</strong>. Preencha:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Titulo</strong> — Nome claro do procedimento
              </li>
              <li>
                <strong>Categoria</strong> — Salao, Cozinha, Bar, Marketing, etc.
              </li>
              <li>
                <strong>Conteudo</strong> — Instrucoes em formato markdown
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "categoria",
        titulo: "3. Escolher categoria",
        conteudo: (
          <p>
            As categorias organizam os SOPs por departamento. Isto permite que os{" "}
            <strong>Clones IA</strong> encontrem o SOP correto ao responder perguntas da equipa.
          </p>
        ),
      },
      {
        id: "salvar",
        titulo: "4. Salvar como rascunho ou publicar",
        conteudo: (
          <p>
            SOPs podem ser salvos como <strong>rascunho</strong> (visivel apenas para admins) ou{" "}
            <strong>publicados</strong> (visivel para toda a equipa e usado pelos Clones).
          </p>
        ),
      },
      {
        id: "versionar",
        titulo: "5. Editar e versionar SOPs existentes",
        conteudo: (
          <p>
            Ao editar um SOP publicado, a versao anterior e mantida no historico. Pode comparar
            versoes e reverter se necessario.
          </p>
        ),
      },
    ],
    dicas: [
      { texto: "Comece pelos SOPs dos processos mais criticos — abertura, fecho, servico." },
      { texto: "Use markdown para formatar: titulos, listas numeradas, negrito para destaques." },
      { texto: "SOPs bem escritos melhoram diretamente a qualidade das respostas dos Clones." },
    ],
    faq: [
      {
        pergunta: "Os Clones usam os SOPs automaticamente?",
        resposta:
          "Sim. SOPs publicados sao indexados como base de conhecimento dos Clones do departamento correspondente.",
      },
      {
        pergunta: "Posso exportar os SOPs?",
        resposta: "Sim, na listagem de SOPs ha opcao de exportar em PDF ou markdown.",
      },
      {
        pergunta: "Quem pode editar SOPs?",
        resposta: "Owners, Admins e Gerentes. A equipa pode visualizar mas nao editar.",
      },
    ],
  },

  crm: {
    titulo: "CRM",
    descricao: "Gira clientes, reservas, pedidos e cardapio num so lugar.",
    secoes: [
      {
        id: "clientes",
        titulo: "1. Clientes",
        conteudo: (
          <>
            <p>No modulo CRM, a aba principal mostra a lista de clientes. Pode:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Buscar</strong> por nome, email ou telefone
              </li>
              <li>
                <strong>Criar</strong> novo cliente com dados de contacto
              </li>
              <li>
                <strong>Editar</strong> informacoes e adicionar notas
              </li>
              <li>
                <strong>Exportar CSV</strong> para uso externo
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "reservas",
        titulo: "2. Reservas",
        conteudo: (
          <>
            <p>Gestao completa de reservas:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Criar reserva com data, hora, numero de pessoas e cliente</li>
              <li>Visualizar calendario semanal com todas as reservas</li>
              <li>
                Mudar status: <strong>pendente → confirmada → concluida → cancelada</strong>
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "pedidos",
        titulo: "3. Pedidos",
        conteudo: (
          <>
            <p>Workflow de pedidos com estados claros:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Criar</strong> pedido associado a mesa ou cliente
              </li>
              <li>
                Acompanhar workflow: <strong>preparing → ready → served → paid</strong>
              </li>
              <li>Cada mudanca de estado e registada com timestamp</li>
            </ul>
          </>
        ),
      },
      {
        id: "cardapio",
        titulo: "4. Cardapio",
        conteudo: (
          <>
            <p>Gestao do cardapio digital:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Criar e organizar categorias (entradas, pratos, sobremesas, bebidas)</li>
              <li>Adicionar pratos com preco, descricao e foto</li>
              <li>Marcar alergenos (gluten, lactose, frutos secos, etc.)</li>
              <li>Ativar/desativar disponibilidade sem apagar o prato</li>
            </ul>
          </>
        ),
      },
    ],
    dicas: [
      { texto: "Exporte a lista de clientes periodicamente como backup." },
      { texto: "Use o calendario de reservas para identificar dias com maior e menor procura." },
      { texto: "Mantenha o cardapio atualizado — os Clones usam-no para responder a clientes." },
    ],
    faq: [
      {
        pergunta: "Posso importar clientes de outro sistema?",
        resposta:
          "Sim, via importacao CSV. O formato esperado esta disponivel para download na pagina de clientes.",
      },
      {
        pergunta: "As reservas enviam confirmacao automatica?",
        resposta:
          "Sim, se o modulo de Automacoes estiver configurado com a automacao de confirmacao de reserva.",
      },
      {
        pergunta: "Como associar um pedido a uma reserva?",
        resposta:
          "Ao criar o pedido, selecione o cliente da reserva. O sistema liga automaticamente.",
      },
    ],
  },

  clones: {
    titulo: "Clones",
    descricao: "Assistentes IA por departamento que respondem com base nos seus SOPs.",
    secoes: [
      {
        id: "departamento",
        titulo: "1. Selecionar departamento",
        conteudo: (
          <p>
            Na pagina de Clones, escolha o departamento:{" "}
            <strong>Salao, Cozinha, Bar, Marketing, Gestao</strong>. Cada clone tem conhecimento
            especializado baseado nos SOPs desse departamento.
          </p>
        ),
      },
      {
        id: "perguntas",
        titulo: "2. Fazer perguntas",
        conteudo: (
          <>
            <p>Interaja como se falasse com um especialista do departamento. Exemplos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>&quot;Qual o procedimento de abertura do salao?&quot;</li>
              <li>&quot;Como lidar com uma reclamacao de cliente?&quot;</li>
              <li>&quot;Quais os alergenos do prato X?&quot;</li>
            </ul>
            <p className="mt-2">
              As respostas sao geradas com base nos SOPs publicados e no cardapio.
            </p>
          </>
        ),
      },
      {
        id: "feedback",
        titulo: "3. Dar feedback",
        conteudo: (
          <p>
            Use os botoes de <strong>thumbs up/down</strong> em cada resposta. Feedback negativo
            sinaliza que o SOP pode precisar de atualizacao. O sistema aprende com o feedback para
            melhorar as respostas futuras.
          </p>
        ),
      },
      {
        id: "melhorar",
        titulo: "4. Melhorar respostas com novos SOPs",
        conteudo: (
          <p>
            Se o clone nao sabe responder, e porque falta um SOP. Va a{" "}
            <strong>Comando → SOPs</strong> e crie o procedimento correspondente. O clone passa a
            usar esse conhecimento automaticamente.
          </p>
        ),
      },
    ],
    dicas: [
      {
        texto: "Quanto mais SOPs de qualidade, melhores as respostas dos Clones.",
      },
      {
        texto: "Use os Clones no onboarding de novos funcionarios — substituem o manual impresso.",
      },
      {
        texto: "O clone de Marketing pode gerar sugestoes de posts com base nos SOPs de marketing.",
      },
    ],
    faq: [
      {
        pergunta: "O clone inventa respostas?",
        resposta:
          "Nao. Se nao tiver SOPs relevantes, informa que nao tem informacao suficiente. Nao alucina.",
      },
      {
        pergunta: "Posso personalizar a personalidade do clone?",
        resposta:
          "Sim. Na configuracao de cada clone pode definir tom (formal, casual) e idioma preferido.",
      },
      {
        pergunta: "Os clones funcionam offline?",
        resposta: "Nao. Precisam de ligacao a internet para processar as perguntas via IA.",
      },
    ],
  },

  automacoes: {
    titulo: "Automacoes",
    descricao: "Configure acoes automaticas para tarefas repetitivas.",
    secoes: [
      {
        id: "criar",
        titulo: "1. Criar automacao",
        conteudo: (
          <>
            <p>
              Na pagina de Automacoes, clique em <strong>&quot;Nova Automacao&quot;</strong>.
              Escolha o tipo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Confirmacao de reserva (WhatsApp/Email)</li>
              <li>Follow-up pos-visita</li>
              <li>Lembrete de reserva</li>
              <li>Alerta de stock baixo</li>
              <li>Notificacao interna para equipa</li>
            </ul>
          </>
        ),
      },
      {
        id: "ativar",
        titulo: "2. Ativar / desativar",
        conteudo: (
          <p>
            Cada automacao tem um toggle de <strong>ativo/inativo</strong>. Desativar nao apaga a
            configuracao — pode reativar a qualquer momento sem reconfigurar.
          </p>
        ),
      },
      {
        id: "logs",
        titulo: "3. Verificar logs de execucao",
        conteudo: (
          <p>
            Na aba <strong>Logs</strong> de cada automacao, veja o historico de execucoes: data,
            hora, destinatario, status (sucesso/erro). Use para diagnosticar problemas e confirmar
            que as automacoes estao a funcionar.
          </p>
        ),
      },
    ],
    dicas: [
      { texto: "Comece com a automacao de confirmacao de reserva — impacto imediato." },
      { texto: "Verifique os logs semanalmente para garantir que nao ha falhas silenciosas." },
      { texto: "Automacoes de follow-up aumentam a taxa de retorno de clientes em ate 30%." },
    ],
    faq: [
      {
        pergunta: "Quantas automacoes posso ter ativas?",
        resposta: "Sem limite tecnico, mas recomendamos comecar com 2-3 e expandir gradualmente.",
      },
      {
        pergunta: "As automacoes funcionam com WhatsApp?",
        resposta:
          "Sim, via integracao com a Evolution API. Precisa de um numero WhatsApp Business conectado.",
      },
      {
        pergunta: "Posso testar antes de ativar?",
        resposta:
          "Sim. Use o botao 'Testar' para enviar uma execucao de teste para o seu proprio numero/email.",
      },
    ],
  },

  fidelidade: {
    titulo: "Receitas / Fidelidade",
    descricao: "Gira o programa de pontos e fidelidade dos seus clientes.",
    secoes: [
      {
        id: "programa",
        titulo: "1. Criar programa de pontos",
        conteudo: (
          <>
            <p>
              Em <strong>Receitas → Fidelidade</strong>, crie o programa definindo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nome do programa</li>
              <li>Regra de pontuacao (ex: 1 ponto por euro gasto)</li>
              <li>Recompensas disponiveis e custo em pontos</li>
            </ul>
          </>
        ),
      },
      {
        id: "pontos",
        titulo: "2. Adicionar pontos a clientes",
        conteudo: (
          <p>
            Os pontos podem ser adicionados <strong>automaticamente</strong> (ao fechar pedido) ou{" "}
            <strong>manualmente</strong> na ficha do cliente. O saldo atualiza em tempo real.
          </p>
        ),
      },
      {
        id: "ranking",
        titulo: "3. Ver ranking e transacoes",
        conteudo: (
          <p>
            O <strong>ranking</strong> mostra os clientes com mais pontos acumulados. O historico de{" "}
            <strong>transacoes</strong> detalha cada ganho e resgate de pontos com data e motivo.
          </p>
        ),
      },
      {
        id: "resgatar",
        titulo: "4. Resgatar pontos",
        conteudo: (
          <p>
            O cliente pode trocar pontos por recompensas definidas no programa. O resgate e
            registado e o saldo deduzido automaticamente.
          </p>
        ),
      },
    ],
    dicas: [
      { texto: "Defina recompensas atrativas mas sustentaveis — o programa deve gerar retorno." },
      { texto: "Comunique o programa de pontos na mesa e nas redes sociais." },
      {
        texto:
          "Use os dados de fidelidade para segmentar campanhas de marketing (clientes VIP vs. inativos).",
      },
    ],
    faq: [
      {
        pergunta: "Os pontos expiram?",
        resposta: "Configuravel. Pode definir validade (ex: 12 meses) ou manter sem expiracao.",
      },
      {
        pergunta: "O cliente consegue ver os seus pontos?",
        resposta:
          "Sim, via notificacao WhatsApp apos cada transacao (se a automacao estiver ativa).",
      },
      {
        pergunta: "Posso ter mais de um programa?",
        resposta: "Sim, por exemplo um programa por marca do grupo. Cada tenant tem o seu.",
      },
    ],
  },

  dashboard: {
    titulo: "Dashboard",
    descricao: "Leia as metricas e KPIs do seu negocio num so ecra.",
    secoes: [
      {
        id: "kpis",
        titulo: "1. KPIs principais",
        conteudo: (
          <>
            <p>O topo do Dashboard mostra 4 KPIs em cards:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Total de Clientes</strong> — base ativa no CRM
              </li>
              <li>
                <strong>Reservas (mes)</strong> — total do mes corrente
              </li>
              <li>
                <strong>Receita (mes)</strong> — soma dos pedidos pagos
              </li>
              <li>
                <strong>Ticket Medio</strong> — receita / numero de pedidos
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "graficos",
        titulo: "2. Graficos de receita e reservas",
        conteudo: (
          <p>
            Dois graficos mostram a evolucao dos <strong>ultimos 30 dias</strong>: receita diaria e
            numero de reservas. Use para identificar tendencias, dias de pico e dias fracos.
          </p>
        ),
      },
      {
        id: "maturidade",
        titulo: "3. Evolucao de maturidade",
        conteudo: (
          <p>
            Grafico de linha com os <strong>scores de diagnostico</strong> ao longo do tempo. Mostra
            se a maturidade operacional esta a subir, estagnada ou a cair.
          </p>
        ),
      },
      {
        id: "roi",
        titulo: "4. ROI da consultoria",
        conteudo: (
          <p>
            Metricas de impacto da consultoria: horas poupadas com SOPs, reducao de erros,
            satisfacao da equipa, evolucao do score. Quantifica o retorno do investimento na
            plataforma.
          </p>
        ),
      },
    ],
    dicas: [
      { texto: "Consulte o Dashboard no inicio de cada semana para ajustar a operacao." },
      { texto: "Compare o ticket medio entre marcas do grupo para identificar oportunidades." },
      { texto: "Use a evolucao de maturidade nas reunioes com a equipa de gestao." },
    ],
    faq: [
      {
        pergunta: "Os dados sao em tempo real?",
        resposta: "Os KPIs atualizam a cada 5 minutos. Os graficos sao recalculados a cada hora.",
      },
      {
        pergunta: "Posso filtrar por marca/tenant?",
        resposta:
          "Sim. O tenant switcher no sidebar filtra automaticamente todos os dados do Dashboard.",
      },
      {
        pergunta: "Posso exportar os dados?",
        resposta: "Sim, os graficos e KPIs podem ser exportados em PDF ou CSV.",
      },
    ],
  },
};

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
