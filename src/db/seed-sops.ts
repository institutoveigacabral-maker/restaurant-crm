import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

config({ path: ".env.local" });

const sopsData = [
  {
    title: "Checklist de Abertura - Salao",
    category: "salao",
    status: "published",
    content: `# Checklist de Abertura - Salao

## 45 minutos antes
- [ ] Verificar limpeza geral do salao (chao, mesas, cadeiras)
- [ ] Ligar sistema AVAC / ar condicionado
- [ ] Verificar WCs (papel, sabonete, limpeza)

## 30 minutos antes
- [ ] Montar mesas conforme layout do dia
- [ ] Verificar reservas no sistema e preparar mesas marcadas
- [ ] Conferir stock de bebidas no bar
- [ ] Verificar guardanapos, talheres, copos em cada mesa

## 15 minutos antes
- [ ] Briefing rapido com equipa:
  - Pratos do dia e sugestoes
  - Alergenos a comunicar
  - Reservas VIP
  - Eventos especiais
- [ ] Ligar musica ambiente (volume adequado)
- [ ] Acender iluminacao (ajustar conforme horario)
- [ ] Verificar uniforme completo de toda equipa

## Na abertura
- [ ] Abrir porta / ativar sinal de aberto
- [ ] Verificar POS/sistema de pagamento funcional
- [ ] Tablet de reservas ligado e sincronizado
- [ ] Menu do dia atualizado (fisico e digital)`,
  },
  {
    title: "Checklist de Fecho - Salao",
    category: "salao",
    status: "published",
    content: `# Checklist de Fecho - Salao

## Apos ultimo cliente
- [ ] Verificar todas as mesas limpas e arrumadas
- [ ] Recolher todos os menus e guardanapos
- [ ] Limpar e organizar bar (garrafas, copos, balcao)

## Fecho operacional
- [ ] Fechar caixa do POS — registar valor total
- [ ] Imprimir resumo do dia (vendas, metodos pagamento)
- [ ] Conferir gorjetas e distribuir conforme regra
- [ ] Desligar equipamentos (maquina cafe, toaster, etc.)

## Limpeza
- [ ] Limpar chao do salao (varrer + lavar)
- [ ] Limpar WCs (ultimo check)
- [ ] Esvaziar lixos e levar ao contentor

## Seguranca
- [ ] Verificar todas as janelas fechadas
- [ ] Desligar AVAC / ar condicionado
- [ ] Desligar luzes (manter seguranca minima)
- [ ] Ativar alarme
- [ ] Trancar portas`,
  },
  {
    title: "Checklist de Abertura - Cozinha",
    category: "cozinha",
    status: "published",
    content: `# Checklist de Abertura - Cozinha

## Equipamentos
- [ ] Ligar fornos e verificar temperatura
- [ ] Ligar fritadeiras e verificar oleo (trocar se necessario)
- [ ] Ligar camaras frigorificas — conferir temperaturas
- [ ] Ligar exaustor / ventilacao

## Mise en place
- [ ] Verificar stock de ingredientes do dia
- [ ] Preparar bases (molhos, caldos, marinadas)
- [ ] Cortar vegetais e proteinas conforme previsao
- [ ] Preparar guarnições
- [ ] Montar estacoes de trabalho

## Higiene
- [ ] Verificar que todas as superficies estao desinfetadas
- [ ] Conferir datas de validade dos ingredientes
- [ ] Verificar temperaturas das camaras (registar no log)
- [ ] Equipa com fardamento limpo e cabelo preso

## Comunicacao
- [ ] Ler encomendas especiais / eventos do dia
- [ ] Confirmar pratos do dia com chef
- [ ] Verificar alergenos a comunicar ao salao`,
  },
  {
    title: "Checklist de Fecho - Cozinha",
    category: "cozinha",
    status: "published",
    content: `# Checklist de Fecho - Cozinha

## Equipamentos
- [ ] Desligar fornos, fritadeiras, grelhadores
- [ ] Limpar e cobrir equipamentos
- [ ] Verificar temperaturas das camaras (registar)
- [ ] Manter apenas camaras frigorificas ligadas

## Alimentos
- [ ] Etiquetar e datar todas as preparacoes
- [ ] Guardar sobras corretamente (tampa, filme, data)
- [ ] Descartar alimentos fora de prazo
- [ ] Verificar stock para o dia seguinte

## Limpeza profunda
- [ ] Limpar todas as bancadas e superficies
- [ ] Limpar chao (varrer + lavar + desinfetar)
- [ ] Limpar grelhas e queimadores
- [ ] Esvaziar lixos (organico, reciclagem, geral)
- [ ] Desinfetar tabuas de corte

## Seguranca
- [ ] Verificar gas fechado
- [ ] Verificar agua fechada (exceto necessario)
- [ ] Exaustor desligado`,
  },
  {
    title: "Protocolo HACCP - Controlo de Temperaturas",
    category: "higiene",
    status: "published",
    content: `# Protocolo HACCP - Controlo de Temperaturas

## Frequencia
Registar 2x/dia: abertura e fecho.

## Temperaturas obrigatorias
| Equipamento | Min | Max | Acao se fora |
|-------------|-----|-----|--------------|
| Camara frio (carnes) | 0 C | 4 C | Transferir imediatamente |
| Camara frio (vegetais) | 2 C | 6 C | Verificar porta/compressor |
| Congelador | -22 C | -18 C | Nao abrir, chamar manutencao |
| Banho-maria | 63 C | -- | Aumentar ou descartar |
| Fritadeira (oleo) | -- | 180 C | Reduzir ou trocar oleo |

## Procedimento
1. Medir com termometro calibrado
2. Registar no formulario (data, hora, valor, responsavel)
3. Se fora do intervalo:
   - Registar incidencia
   - Tomar acao corretiva imediata
   - Informar responsavel de turno
   - Re-medir apos 30 minutos

## Recepcao de mercadorias
- Refrigerados: aceitar apenas < 5 C
- Congelados: aceitar apenas < -18 C
- Rejeitar entregas fora de temperatura`,
  },
  {
    title: "Protocolo de Atendimento ao Cliente",
    category: "atendimento",
    status: "published",
    content: `# Protocolo de Atendimento ao Cliente

## Chegada (30 segundos)
1. Cumprimentar com sorriso e contacto visual
2. "Boa noite, bem-vindos ao [nome do restaurante]"
3. Perguntar se tem reserva
4. Acompanhar a mesa (nunca apontar de longe)

## Acomodacao (2 minutos)
1. Apresentar menu e sugestoes do dia
2. Oferecer agua (com ou sem gas)
3. Informar tempo estimado se houver espera

## Pedido (quando cliente sinalizar)
1. Ouvir com atencao, repetir pedido
2. Sugerir harmonizacao (vinho, entrada)
3. Informar alergenos relevantes
4. Registar no POS imediatamente

## Durante a refeicao
- Verificar satisfacao apos primeiras garfadas
- Manter copos cheios (agua e vinho)
- Retirar pratos vazios sem pressionar
- Oferecer sobremesa e cafe

## Despedida
1. Apresentar conta quando solicitado
2. Agradecer a visita
3. "Esperamos ve-los novamente"
4. Acompanhar a saida se possivel

## Reclamacoes
1. NUNCA discutir com o cliente
2. Ouvir ate ao fim
3. Pedir desculpa genuinamente
4. Oferecer solucao concreta
5. Informar gerente se necessario
6. Registar incidencia no sistema`,
  },
  {
    title: "Onboarding - Novo Colaborador (Semana 1)",
    category: "rh",
    status: "published",
    content: `# Onboarding - Novo Colaborador

## Dia 1 - Acolhimento
- [ ] Apresentar a equipa e gerente
- [ ] Tour completo pelo espaco (salao, cozinha, armazem, WCs staff)
- [ ] Entregar fardamento e cacifo
- [ ] Explicar horarios, pausas e regras da casa
- [ ] Configurar acesso ao sistema (POS, app de turnos)
- [ ] Entregar copia dos SOPs relevantes para a funcao

## Dia 2-3 - Acompanhamento
- [ ] Shadow de um colega experiente
- [ ] Praticar abertura de mesa e registo de pedidos
- [ ] Conhecer o menu completo (pratos, ingredientes, alergenos)
- [ ] Praticar uso do POS (pedido, pagamento, split)

## Dia 4-5 - Autonomia assistida
- [ ] Atender mesas com supervisao
- [ ] Resolver 1 situacao simples sozinho
- [ ] Feedback do gerente ao final do turno

## Final da Semana 1
- [ ] Avaliacao informal com gerente
- [ ] Pontos fortes e areas de melhoria
- [ ] Definir objetivos para semana 2
- [ ] Confirmar continuidade`,
  },
  {
    title: "Procedimento de Limpeza Diaria",
    category: "higiene",
    status: "published",
    content: `# Procedimento de Limpeza Diaria

## Salao (antes e apos servico)
1. Varrer chao completo
2. Lavar chao com produto adequado
3. Limpar mesas com desinfetante alimentar
4. Limpar cadeiras (assento e encosto)
5. Limpar vidros e espelhos
6. Limpar macanetas de portas

## Cozinha (apos cada servico)
1. Limpar bancadas com desinfetante
2. Limpar equipamentos usados
3. Varrer e lavar chao
4. Desinfetar tabuas de corte (por cor)
5. Limpar puxadores de camaras
6. Esvaziar e lavar lixos

## WCs (3x por dia minimo)
1. Limpar e desinfetar sanitas
2. Limpar lavatorios e espelhos
3. Reabastecer papel, sabonete, toalhas
4. Varrer e lavar chao
5. Verificar funcionamento de autoclismo
6. Verificar cheiro (ambientador se necessario)

## Semanal (programar por dia)
- Segunda: Limpeza profunda de vidros
- Terca: Limpeza de exaustor e filtros
- Quarta: Descongelacao e limpeza de camaras
- Quinta: Limpeza de equipamentos (forno, fritadeira)
- Sexta: Limpeza de areas de armazenamento`,
  },
];

async function seedSops() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Inserindo SOPs operacionais...");

  // Get admin user and all tenants
  const [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "henrique@nexial.pt"))
    .limit(1);

  const tenants = await db.select().from(schema.tenants);
  const parentTenant = tenants.find((t) => !t.parentId);
  const childTenants = tenants.filter((t) => t.parentId);

  if (!admin || !parentTenant) {
    console.error("Admin ou tenant pai nao encontrado. Rode db:seed primeiro.");
    return;
  }

  // Insert SOPs for parent tenant (Grupo Pateo) — SOPs sao do grupo, aplicam a todas as marcas
  for (const sop of sopsData) {
    await db.insert(schema.sops).values({
      tenantId: parentTenant.id,
      title: sop.title,
      category: sop.category,
      content: sop.content,
      status: sop.status,
      createdBy: admin.id,
    });
  }

  console.log(`${sopsData.length} SOPs criados para ${parentTenant.name}`);

  // Also insert for each child tenant
  for (const child of childTenants) {
    for (const sop of sopsData) {
      await db.insert(schema.sops).values({
        tenantId: child.id,
        title: sop.title,
        category: sop.category,
        content: sop.content,
        status: sop.status,
        createdBy: admin.id,
      });
    }
    console.log(`${sopsData.length} SOPs criados para ${child.name}`);
  }

  console.log("\nSOPs operacionais inseridos com sucesso!");
}

seedSops().catch(console.error);
