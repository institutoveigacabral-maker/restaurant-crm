import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

async function reset() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Limpando todos os dados...\n");

  // TRUNCATE CASCADE limpa tudo de uma vez respeitando FKs
  await sql`TRUNCATE TABLE
    automation_logs, automations,
    clone_knowledge_base, clones,
    loyalty_transactions, loyalty_balances, loyalty_programs,
    onboarding_progress, onboarding_checklists, documents, sops,
    diagnostics, diagnostic_templates,
    challenge_participations, challenges,
    employee_badges, badges,
    xp_transactions, course_enrollments, courses, employee_profiles,
    webhook_logs, webhooks,
    notifications,
    activity_log,
    orders, reservations,
    menu_items, menu_categories,
    customers,
    feature_flags, restaurant_settings,
    tenant_users,
    sessions, accounts, verification_tokens,
    users,
    tenants
    CASCADE`;

  console.log("Todas as tabelas limpas.");

  // Verificar
  const count = await sql`SELECT
    (SELECT count(*) FROM tenants) as tenants,
    (SELECT count(*) FROM users) as users,
    (SELECT count(*) FROM customers) as customers,
    (SELECT count(*) FROM diagnostics) as diagnostics,
    (SELECT count(*) FROM sops) as sops`;

  console.log("\nVerificacao:");
  console.log("  Tenants:", count[0].tenants);
  console.log("  Users:", count[0].users);
  console.log("  Customers:", count[0].customers);
  console.log("  Diagnostics:", count[0].diagnostics);
  console.log("  SOPs:", count[0].sops);
  console.log("\nBanco zerado. Plataforma limpa.");
}

reset().catch(console.error);
