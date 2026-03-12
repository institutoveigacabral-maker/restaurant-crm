import { db } from "@/db";
import { restaurantSettings, featureFlags } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSettings() {
  const rows = await db.select().from(restaurantSettings).limit(1);

  if (rows.length > 0) return rows[0];

  const created = await db
    .insert(restaurantSettings)
    .values({ name: "Meu Restaurante" })
    .returning();

  return created[0];
}

export async function updateSettings(
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
    .where(eq(restaurantSettings.id, id))
    .returning();

  return result[0];
}

export async function getFeatureFlags() {
  return db.select().from(featureFlags);
}

export async function getFeatureFlag(key: string) {
  const rows = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
  return rows[0] ?? null;
}

export async function upsertFeatureFlag(key: string, enabled: boolean, description?: string) {
  const existing = await getFeatureFlag(key);

  if (existing) {
    const values: Record<string, unknown> = { enabled };
    if (description !== undefined) values.description = description;

    const result = await db
      .update(featureFlags)
      .set(values)
      .where(eq(featureFlags.key, key))
      .returning();
    return result[0];
  }

  const result = await db
    .insert(featureFlags)
    .values({ key, enabled, description: description ?? "" })
    .returning();
  return result[0];
}
