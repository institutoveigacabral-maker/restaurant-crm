import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import {
  MenuCategoryInput,
  MenuCategoryUpdateInput,
  MenuItemInput,
  MenuItemUpdateInput,
} from "@/lib/validations/menu";

// ── Categories ──────────────────────────────────────────────

export async function getAllCategories(tenantId: string) {
  return db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.tenantId, tenantId))
    .orderBy(menuCategories.sortOrder);
}

export async function createCategory(tenantId: string, data: MenuCategoryInput) {
  const result = await db
    .insert(menuCategories)
    .values({
      tenantId,
      name: data.name,
      description: data.description,
    })
    .returning();
  return result[0];
}

export async function updateCategory(tenantId: string, data: MenuCategoryUpdateInput) {
  const result = await db
    .update(menuCategories)
    .set({
      name: data.name,
      description: data.description,
    })
    .where(and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.id, data.id)))
    .returning();
  return result[0];
}

export async function deleteCategory(tenantId: string, id: number) {
  await db
    .delete(menuCategories)
    .where(and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.id, id)));
}

// ── Menu Items ──────────────────────────────────────────────

export async function getAllMenuItems(tenantId: string) {
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), isNull(menuItems.deletedAt)))
    .orderBy(menuItems.name);
}

export async function createMenuItem(tenantId: string, data: MenuItemInput) {
  const result = await db
    .insert(menuItems)
    .values({
      tenantId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: String(data.price),
      available: data.available,
    })
    .returning();
  return result[0];
}

export async function updateMenuItem(tenantId: string, data: MenuItemUpdateInput) {
  const result = await db
    .update(menuItems)
    .set({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: String(data.price),
      available: data.available,
    })
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, data.id)))
    .returning();
  return result[0];
}

export async function softDeleteMenuItem(tenantId: string, id: number) {
  await db
    .update(menuItems)
    .set({ deletedAt: new Date() })
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, id)));
}

export async function toggleMenuItemAvailability(tenantId: string, id: number) {
  const item = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, id)))
    .limit(1);

  if (!item[0]) throw new Error("Item não encontrado");

  const result = await db
    .update(menuItems)
    .set({ available: !item[0].available })
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, id)))
    .returning();
  return result[0];
}
