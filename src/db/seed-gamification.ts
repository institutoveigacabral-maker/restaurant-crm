import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

config({ path: ".env.local" });

const badgesData = [
  {
    name: "Primeiro Dia",
    description: "Completar primeiro turno",
    icon: "star",
    category: "onboarding",
    rarity: "common",
    xpReward: 25,
    criteria: { type: "first_shift_completed", target: 1 },
  },
  {
    name: "Mestre da Mesa",
    description: "50 mesas atendidas",
    icon: "utensils",
    category: "atendimento",
    rarity: "rare",
    xpReward: 100,
    criteria: { type: "tables_served", target: 50 },
  },
  {
    name: "Estrela HACCP",
    description: "30 dias sem incidencia",
    icon: "shield",
    category: "higiene",
    rarity: "rare",
    xpReward: 100,
    criteria: { type: "days_without_incident", target: 30 },
  },
  {
    name: "Velocista",
    description: "Tempo medio preparacao < 15min",
    icon: "zap",
    category: "cozinha",
    rarity: "epic",
    xpReward: 200,
    criteria: { type: "avg_prep_time_under", target: 15 },
  },
  {
    name: "Cliente Feliz",
    description: "10 avaliacoes positivas",
    icon: "smile",
    category: "atendimento",
    rarity: "epic",
    xpReward: 200,
    criteria: { type: "positive_reviews", target: 10 },
  },
  {
    name: "Lenda da Casa",
    description: "6 meses sem falta",
    icon: "crown",
    category: "geral",
    rarity: "legendary",
    xpReward: 500,
    criteria: { type: "months_no_absence", target: 6 },
  },
];

const challengesData = [
  {
    title: "Desafio Abertura Perfeita",
    description: "Complete 20 checklists de abertura sem falhas durante o mes de abril",
    type: "individual",
    category: "operacao",
    xpReward: 150,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    goal: { type: "checklist_completion", target: 20 },
  },
  {
    title: "Mestre do Atendimento",
    description: "Receba 10 avaliacoes positivas de clientes durante o mes de abril",
    type: "individual",
    category: "atendimento",
    xpReward: 200,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    goal: { type: "customer_satisfaction", target: 10 },
  },
  {
    title: "Equipa Unida",
    description: "Equipa completa sem faltas durante 30 dias consecutivos (abril-maio)",
    type: "team",
    category: "geral",
    xpReward: 300,
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    goal: { type: "team_streak", target: 30 },
  },
];

async function seedGamification() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Inserindo badges e challenges de gamificacao...");

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

  const allTenants = [parentTenant, ...childTenants];

  for (const tenant of allTenants) {
    // Insert badges
    for (const badge of badgesData) {
      await db.insert(schema.badges).values({
        tenantId: tenant.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        xpReward: badge.xpReward,
        criteria: badge.criteria,
      });
    }
    console.log(`${badgesData.length} badges criados para ${tenant.name}`);

    // Insert challenges
    for (const challenge of challengesData) {
      await db.insert(schema.challenges).values({
        tenantId: tenant.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        category: challenge.category,
        xpReward: challenge.xpReward,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        goal: challenge.goal,
      });
    }
    console.log(`${challengesData.length} challenges criados para ${tenant.name}`);
  }

  console.log(
    `\nGamificacao inserida com sucesso! ${allTenants.length} tenants x (${badgesData.length} badges + ${challengesData.length} challenges)`
  );
}

seedGamification().catch(console.error);
