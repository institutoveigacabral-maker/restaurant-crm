import { describe, it, expect } from "vitest";
import {
  menuCategorySchema,
  menuCategoryUpdateSchema,
  menuItemSchema,
  menuItemUpdateSchema,
} from "@/lib/validations/menu";

describe("menuCategorySchema", () => {
  it("accepts valid category with name only", () => {
    const result = menuCategorySchema.safeParse({ name: "Entradas" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Entradas");
      expect(result.data.description).toBe("");
    }
  });

  it("accepts valid category with name and description", () => {
    const result = menuCategorySchema.safeParse({
      name: "Pratos Principais",
      description: "Carnes, peixes e massas",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Carnes, peixes e massas");
    }
  });

  it("rejects empty name", () => {
    const result = menuCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nome é obrigatório");
    }
  });

  it("rejects missing name", () => {
    const result = menuCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("defaults description to empty string when omitted", () => {
    const result = menuCategorySchema.parse({ name: "Sobremesas" });
    expect(result.description).toBe("");
  });
});

describe("menuCategoryUpdateSchema", () => {
  it("requires a positive id", () => {
    const result = menuCategoryUpdateSchema.safeParse({
      id: 1,
      name: "Bebidas",
    });
    expect(result.success).toBe(true);
  });

  it("rejects id = 0", () => {
    const result = menuCategoryUpdateSchema.safeParse({
      id: 0,
      name: "Bebidas",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = menuCategoryUpdateSchema.safeParse({
      id: -5,
      name: "Bebidas",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string id to number", () => {
    const result = menuCategoryUpdateSchema.safeParse({
      id: "3",
      name: "Bebidas",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(3);
    }
  });
});

describe("menuItemSchema", () => {
  const validItem = {
    categoryId: 1,
    name: "Picanha na Brasa",
    description: "200g com acompanhamentos",
    price: 89.9,
    available: true,
  };

  it("accepts valid menu item", () => {
    const result = menuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts item without description (defaults to empty)", () => {
    const result = menuItemSchema.parse({
      categoryId: 1,
      name: "Agua",
      price: 5,
    });
    expect(result.description).toBe("");
    expect(result.available).toBe(true);
  });

  it("rejects empty name", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = menuItemSchema.safeParse({
      name: "Picanha",
      price: 89.9,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero categoryId", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      categoryId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      price: "29.90",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(29.9);
    }
  });

  it("coerces string categoryId to number", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      categoryId: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(5);
    }
  });

  it("defaults available to true", () => {
    const result = menuItemSchema.parse({
      categoryId: 1,
      name: "Suco",
      price: 12,
    });
    expect(result.available).toBe(true);
  });

  it("accepts available = false", () => {
    const result = menuItemSchema.safeParse({
      ...validItem,
      available: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.available).toBe(false);
    }
  });
});

describe("menuItemUpdateSchema", () => {
  it("requires a positive id", () => {
    const result = menuItemUpdateSchema.safeParse({
      id: 1,
      categoryId: 1,
      name: "Picanha",
      price: 89.9,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = menuItemUpdateSchema.safeParse({
      categoryId: 1,
      name: "Picanha",
      price: 89.9,
    });
    expect(result.success).toBe(false);
  });

  it("rejects id = 0", () => {
    const result = menuItemUpdateSchema.safeParse({
      id: 0,
      categoryId: 1,
      name: "Picanha",
      price: 89.9,
    });
    expect(result.success).toBe(false);
  });
});
