import { db } from "@/db";
import { automations, customers, reservations } from "@/db/schema";
import { and, eq, sql, lt } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import {
  reservationConfirmationEmail,
  reservationReminderEmail,
  welcomeEmail,
  churnAlertEmail,
} from "@/lib/email-templates";
import { logExecution } from "@/services/automations";
import { createNotification } from "@/services/notifications";

type AutomationType =
  | "reservation_confirmed"
  | "reservation_reminder"
  | "customer_welcome"
  | "customer_inactive"
  | "checklist_completed";

/**
 * Execute automation when a reservation is confirmed.
 * Called from the reservations API after status change.
 */
export async function onReservationConfirmed(
  tenantId: string,
  reservation: { customerName: string; date: string; time: string; guests: number; table: string },
  customerEmail?: string
) {
  const auto = await findActiveAutomation(tenantId, "reservation_confirmed");
  if (!auto) return null;

  if (customerEmail) {
    const html = reservationConfirmationEmail({
      customerName: reservation.customerName,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      table: reservation.table,
    });

    await sendEmail({
      to: customerEmail,
      subject: `Reserva confirmada — ${reservation.date} as ${reservation.time}`,
      html,
    });
  }

  await createNotification(tenantId, {
    title: "Reserva confirmada",
    message: `${reservation.customerName} — ${reservation.date} as ${reservation.time} (${reservation.guests} pessoas)`,
    type: "success",
    link: "/crm/reservas",
  });

  await logExecution(auto.id, tenantId, "success", { reservation }, { emailSent: !!customerEmail });
  return { executed: true, type: "reservation_confirmed" };
}

/**
 * Execute automation when a new customer is created.
 * Called from the customers API after insert.
 */
export async function onCustomerCreated(
  tenantId: string,
  customer: { name: string; email: string }
) {
  const auto = await findActiveAutomation(tenantId, "customer_welcome");
  if (!auto) return null;

  const html = welcomeEmail({ customerName: customer.name });

  await sendEmail({
    to: customer.email,
    subject: "Bem-vindo!",
    html,
  });

  await createNotification(tenantId, {
    title: "Novo cliente",
    message: `${customer.name} foi adicionado ao CRM e recebeu email de boas-vindas`,
    type: "info",
    link: "/crm/clientes",
  });

  await logExecution(auto.id, tenantId, "success", { customer }, { emailSent: true });
  return { executed: true, type: "customer_welcome" };
}

/**
 * Find and email inactive customers (> 30 days without visit).
 * Called via cron endpoint /api/automations/execute.
 */
export async function runInactiveCustomerCheck(tenantId: string) {
  const auto = await findActiveAutomation(tenantId, "customer_inactive");
  if (!auto) return { executed: false, reason: "automation_inactive" };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const inactive = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        sql`${customers.deletedAt} IS NULL`,
        lt(customers.lastVisit, thirtyDaysAgo.toISOString().split("T")[0])
      )
    );

  let sent = 0;
  for (const c of inactive) {
    if (!c.email) continue;
    const daysSince = Math.floor(
      (Date.now() - new Date(c.lastVisit || "").getTime()) / (1000 * 60 * 60 * 24)
    );

    const html = churnAlertEmail({
      customerName: c.name,
      lastVisit: c.lastVisit || "desconhecida",
      daysSince,
    });

    await sendEmail({
      to: c.email,
      subject: "Sentimos sua falta!",
      html,
    });
    sent++;
  }

  if (sent > 0) {
    await createNotification(tenantId, {
      title: "Clientes inativos contactados",
      message: `${sent} email(s) "sentimos sua falta" enviado(s) para clientes sem visita ha 30+ dias`,
      type: "warning",
      link: "/crm/clientes",
    });
  }

  await logExecution(
    auto.id,
    tenantId,
    "success",
    { inactiveCount: inactive.length },
    { emailsSent: sent }
  );
  return { executed: true, type: "customer_inactive", processed: inactive.length, sent };
}

/**
 * Find reservations for tomorrow and send reminders.
 * Called via cron endpoint /api/automations/execute.
 */
export async function runReservationReminders(tenantId: string) {
  const auto = await findActiveAutomation(tenantId, "reservation_reminder");
  if (!auto) return { executed: false, reason: "automation_inactive" };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const tomorrowReservations = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.tenantId, tenantId),
        eq(reservations.date, tomorrowStr),
        eq(reservations.status, "confirmed")
      )
    );

  let sent = 0;
  for (const r of tomorrowReservations) {
    // Get customer email
    if (!r.customerId) continue;
    const [customer] = await db
      .select({ email: customers.email })
      .from(customers)
      .where(eq(customers.id, r.customerId))
      .limit(1);

    if (!customer?.email) continue;

    const html = reservationReminderEmail({
      customerName: r.customerName || "Cliente",
      date: r.date,
      time: r.time,
      guests: r.guests,
    });

    await sendEmail({
      to: customer.email,
      subject: `Lembrete: reserva amanha as ${r.time}`,
      html,
    });
    sent++;
  }

  if (sent > 0) {
    await createNotification(tenantId, {
      title: "Lembretes de reserva enviados",
      message: `${sent} lembrete(s) enviado(s) para reservas de amanha`,
      type: "info",
      link: "/crm/reservas",
    });
  }

  await logExecution(
    auto.id,
    tenantId,
    "success",
    { reservationsFound: tomorrowReservations.length },
    { emailsSent: sent }
  );
  return { executed: true, type: "reservation_reminder", found: tomorrowReservations.length, sent };
}

// --- Helpers ---

async function findActiveAutomation(tenantId: string, type: AutomationType) {
  const result = await db
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.tenantId, tenantId),
        eq(automations.type, type),
        eq(automations.active, true)
      )
    )
    .limit(1);
  return result[0] ?? null;
}
