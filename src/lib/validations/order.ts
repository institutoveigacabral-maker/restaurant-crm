import { z } from "zod";

const orderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

export const orderCreateSchema = z.object({
  customerId: z.number().int().optional(),
  customerName: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  total: z.number().min(0),
  status: z.enum(["pending", "preparing", "served", "paid", "cancelled"]).default("pending"),
  date: z.string().optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
