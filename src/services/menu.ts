import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import {
  MenuCategoryInput,
  MenuCategoryUpdateInput,
  MenuItemInput,
  MenuItemUpdateInput,
} from "@/lib/validations/menu";

// ── Categories ──────────────────────────────────────────────

export async function getAllCategories() {
  return db.select().from(menuCategories).orderBy(menuCategories.sortOrder);
}

export async function createCategory(data: MenuCategoryInput) {
  const result = await db
    .insert(menuCategories)
    .values({
      name: data.name,
      description: data.description,
    })
    .returning();
  return result[0];
}

export async function updateCategory(data: MenuCategoryUpdateInput) {
  const result = await db
    .update(menuCategories)
    .set({
      name: data.name,
      description: data.description,
    })
    .where(eq(menuCategories.id, data.id))
    .returning();
  return result[0];
}

export async function deleteCategory(id: number) {
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
}

// ── Menu Items ──────────────────────────────────────────────

export async function getAllMenuItems() {
  return db.select().from(menuItems).where(isNull(menuItems.deletedAt)).orderBy(menuItems.name);
}

export async function createMenuItem(data: MenuItemInput) {
  const result = await db
    .insert(menuItems)
    .values({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: String(data.price),
      available: data.available,
    })
    .returning();
  return result[0];
}

export async function updateMenuItem(data: MenuItemUpdateInput) {
  const result = await db
    .update(menuItems)
    .set({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: String(data.price),
      available: data.available,
    })
    .where(eq(menuItems.id, data.id))
    .returning();
  return result[0];
}

export async function softDeleteMenuItem(id: number) {
  await db.update(menuItems).set({ deletedAt: new Date() }).where(eq(menuItems.id, id));
}

export async function toggleMenuItemAvailability(id: number) {
  const item = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);

  if (!item[0]) throw new Error("Item não encontrado");

  const result = await db
    .update(menuItems)
    .set({ available: !item[0].available })
    .where(eq(menuItems.id, id))
    .returning();
  return result[0];
}
