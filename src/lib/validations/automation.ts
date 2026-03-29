import { z } from "zod";

export const AUTOMATION_TYPES = [
  "reservation_confirmed",
  "reservation_reminder",
  "customer_welcome",
  "customer_inactive",
  "checklist_completed",
] as const;

export type AutomationType = (typeof AUTOMATION_TYPES)[number];

export const AUTOMATION_TYPE_LABELS: Record<AutomationType, string> = {
  reservation_confirmed: "Confirmacao de Reserva",
  reservation_reminder: "Lembrete de Reserva",
  customer_welcome: "Boas-vindas ao Cliente",
  customer_inactive: "Cliente Inativo",
  checklist_completed: "Checklist Concluida",
};

export const AUTOMATION_TYPE_TRIGGERS: Record<AutomationType, string> = {
  reservation_confirmed: "Reserva muda status para confirmed",
  reservation_reminder: "24h antes da reserva",
  customer_welcome: "Novo cliente criado",
  customer_inactive: "Cliente sem visita > 30 dias",
  checklist_completed: "User completa checklist onboarding",
};

export const AUTOMATION_TYPE_ACTIONS: Record<AutomationType, string> = {
  reservation_confirmed: "Enviar email de confirmacao",
  reservation_reminder: "Enviar email lembrete",
  customer_welcome: "Enviar email boas-vindas",
  customer_inactive: "Enviar email 'sentimos falta'",
  checklist_completed: "Conceder badge + XP",
};

export const automationCreateSchema = z.object({
  name: z.string().min(3).max(255),
  type: z.enum(AUTOMATION_TYPES),
  active: z.boolean().default(true),
});

export const automationUpdateSchema = automationCreateSchema.partial();

export type AutomationCreateInput = z.infer<typeof automationCreateSchema>;
export type AutomationUpdateInput = z.infer<typeof automationUpdateSchema>;
