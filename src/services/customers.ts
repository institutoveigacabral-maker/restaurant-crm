import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { CustomerInput, CustomerUpdateInput } from "@/lib/validations/customer";

export async function getAllCustomers() {
  return db
    .select()
    .from(customers)
    .where(isNull(customers.deletedAt))
    .orderBy(customers.createdAt);
}

export async function getCustomerById(id: number) {
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createCustomer(data: CustomerInput) {
  const result = await db
    .insert(customers)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      tags: data.tags,
      lastVisit: new Date().toISOString().split("T")[0],
    })
    .returning();
  return result[0];
}

export async function updateCustomer(data: CustomerUpdateInput) {
  const result = await db
    .update(customers)
    .set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      tags: data.tags,
    })
    .where(eq(customers.id, data.id))
    .returning();
  return result[0];
}

export async function softDeleteCustomer(id: number) {
  await db.update(customers).set({ deletedAt: new Date() }).where(eq(customers.id, id));
}
