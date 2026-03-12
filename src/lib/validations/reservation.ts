import { z } from "zod";

export const reservationSchema = z.object({
  customerId: z.coerce.number().positive("Selecione um cliente"),
  customerName: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  guests: z.coerce.number().min(1, "Mínimo 1 pessoa").max(100),
  table: z.string().min(1, "Informe a mesa"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
  notes: z.string().max(500).optional().default(""),
});

export const reservationUpdateSchema = reservationSchema.extend({
  id: z.coerce.number().positive(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
