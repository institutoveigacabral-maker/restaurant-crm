import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

config({ path: ".env.local" });

const automationsData = [
  {
    name: "Confirmacao de Reserva",
    type: "reservation_confirmed",
    trigger: { event: "reservation.status.confirmed" },
    actions: [{ type: "email", template: "reservationConfirmation" }],
    active: true,
  },
  {
    name: "Lembrete de Reserva (24h antes)",
    type: "reservation_reminder",
    trigger: { event: "cron.daily.reservations", offset: "24h" },
    actions: [{ type: "email", template: "reservationReminder" }],
    active: true,
  },
  {
    name: "Boas-vindas ao Cliente",
    type: "customer_welcome",
    trigger: { event: "customer.created" },
    actions: [{ type: "email", template: "welcome" }],
    active: true,
  },
  {
    name: "Cliente Inativo (30 dias)",
    type: "customer_inactive",
    trigger: { event: "cron.daily.inactive", thresholdDays: 30 },
    actions: [{ type: "email", template: "churnAlert" }],
    active: true,
  },
  {
    name: "Checklist Concluida",
    type: "checklist_completed",
    trigger: { event: "onboarding.checklist.completed" },
    actions: [{ type: "badge", reward: "completion_xp" }],
    active: false,
  },
];

async function seedAutomations() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Inserindo automacoes...");

  const tenants = await db.select().from(schema.tenants);
  if (tenants.length === 0) {
    console.error("Nenhum tenant encontrado. Rode db:seed primeiro.");
    return;
  }

  for (const tenant of tenants) {
    for (const auto of automationsData) {
      await db.insert(schema.automations).values({
        tenantId: tenant.id,
        name: auto.name,
        type: auto.type,
        trigger: auto.trigger,
        actions: auto.actions,
        active: auto.active,
      });
    }
    console.log(`${automationsData.length} automacoes criadas para ${tenant.name}`);
  }

  console.log("\nAutomacoes inseridas com sucesso!");
}

seedAutomations().catch(console.error);
