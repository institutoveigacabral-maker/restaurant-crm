import { db } from "@/db";
import { restaurantSettings, featureFlags } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getSettings(tenantId: string) {
  const rows = await db
    .select()
    .from(restaurantSettings)
    .where(eq(restaurantSettings.tenantId, tenantId))
    .limit(1);

  if (rows.length > 0) return rows[0];

  const created = await db
    .insert(restaurantSettings)
    .values({ tenantId, name: "Meu Restaurante" })
    .returning();

  return created[0];
}

export async function updateSettings(
  tenantId: string,
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    openingHours: Record<string, unknown>;
    currency: string;
    timezone: string;
    maxReservationsPerSlot: number;
    reservationDuration: number;
    autoConfirmReservations: boolean;
    emailNotifications: boolean;
  }>
) {
  const values: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) values.name = data.name;
  if (data.slug !== undefined) values.slug = data.slug;
  if (data.logo !== undefined) values.logo = data.logo;
  if (data.phone !== undefined) values.phone = data.phone;
  if (data.email !== undefined) values.email = data.email;
  if (data.address !== undefined) values.address = data.address;
  if (data.openingHours !== undefined) values.openingHours = data.openingHours;
  if (data.currency !== undefined) values.currency = data.currency;
  if (data.timezone !== undefined) values.timezone = data.timezone;
  if (data.maxReservationsPerSlot !== undefined)
    values.maxReservationsPerSlot = data.maxReservationsPerSlot;
  if (data.reservationDuration !== undefined) values.reservationDuration = data.reservationDuration;
  if (data.autoConfirmReservations !== undefined)
    values.autoConfirmReservations = data.autoConfirmReservations;
  if (data.emailNotifications !== undefined) values.emailNotifications = data.emailNotifications;

  const result = await db
    .update(restaurantSettings)
    .set(values)
    .where(and(eq(restaurantSettings.tenantId, tenantId), eq(restaurantSettings.id, id)))
    .returning();

  return result[0];
}

export async function getFeatureFlags(tenantId: string) {
  return db.select().from(featureFlags).where(eq(featureFlags.tenantId, tenantId));
}

export async function getFeatureFlag(tenantId: string, key: string) {
  const rows = await db
    .select()
    .from(featureFlags)
    .where(and(eq(featureFlags.tenantId, tenantId), eq(featureFlags.key, key)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertFeatureFlag(
  tenantId: string,
  key: string,
  enabled: boolean,
  description?: string
) {
  const existing = await getFeatureFlag(tenantId, key);

  if (existing) {
    const values: Record<string, unknown> = { enabled };
    if (description !== undefined) values.description = description;

    const result = await db
      .update(featureFlags)
      .set(values)
      .where(and(eq(featureFlags.tenantId, tenantId), eq(featureFlags.key, key)))
      .returning();
    return result[0];
  }

  const result = await db
    .insert(featureFlags)
    .values({ tenantId, key, enabled, description: description ?? "" })
    .returning();
  return result[0];
}
