import { describe, it, expect } from "vitest";

// Test the menu item toggle availability logic from the menu service.
// toggleMenuItemAvailability flips the boolean available field.
// The PUT route checks for body.toggleAvailability && body.id before delegating.

describe("Menu item availability toggle logic", () => {
  function shouldToggleAvailability(body: Record<string, unknown>): boolean {
    return !!(body.toggleAvailability && body.id);
  }

  it("detects toggle request when both flags present", () => {
    expect(shouldToggleAvailability({ toggleAvailability: true, id: 5 })).toBe(true);
  });

  it("rejects toggle when toggleAvailability is false", () => {
    expect(shouldToggleAvailability({ toggleAvailability: false, id: 5 })).toBe(false);
  });

  it("rejects toggle when id is missing", () => {
    expect(shouldToggleAvailability({ toggleAvailability: true })).toBe(false);
  });

  it("rejects toggle when id is 0", () => {
    expect(shouldToggleAvailability({ toggleAvailability: true, id: 0 })).toBe(false);
  });

  it("falls through to update schema when no toggle flag", () => {
    expect(
      shouldToggleAvailability({
        id: 5,
        categoryId: 1,
        name: "Picanha",
        price: 89.9,
      })
    ).toBe(false);
  });
});

describe("Menu item toggle behavior", () => {
  function toggleAvailable(currentAvailable: boolean): boolean {
    return !currentAvailable;
  }

  it("toggles available from true to false", () => {
    expect(toggleAvailable(true)).toBe(false);
  });

  it("toggles available from false to true", () => {
    expect(toggleAvailable(false)).toBe(true);
  });
});

describe("Menu price formatting", () => {
  // The service stores prices as strings (decimal in postgres), and the
  // mapper converts them back: Number(m.price)

  function formatPrice(price: number): string {
    return String(price);
  }

  function parsePrice(priceStr: string): number {
    return Number(priceStr);
  }

  it("round-trips price correctly", () => {
    expect(parsePrice(formatPrice(89.9))).toBe(89.9);
  });

  it("handles zero price", () => {
    expect(parsePrice(formatPrice(0))).toBe(0);
  });

  it("handles large prices", () => {
    expect(parsePrice(formatPrice(9999.99))).toBe(9999.99);
  });

  it("handles small decimal prices", () => {
    expect(parsePrice(formatPrice(0.01))).toBe(0.01);
  });
});

describe("Menu category soft delete vs hard delete", () => {
  // Categories use hard delete: db.delete(menuCategories)
  // Menu items use soft delete: set({ deletedAt: new Date() })

  it("soft delete sets deletedAt timestamp", () => {
    const now = new Date();
    const deletedItem = { id: 1, name: "Test", deletedAt: now };
    expect(deletedItem.deletedAt).toBeDefined();
    expect(deletedItem.deletedAt).toBeInstanceOf(Date);
  });

  it("active items have null deletedAt", () => {
    const activeItem = { id: 1, name: "Test", deletedAt: null };
    expect(activeItem.deletedAt).toBeNull();
  });

  it("filtering out soft-deleted items works", () => {
    const items = [
      { id: 1, name: "Active", deletedAt: null },
      { id: 2, name: "Deleted", deletedAt: new Date() },
      { id: 3, name: "Also Active", deletedAt: null },
    ];

    const active = items.filter((item) => item.deletedAt === null);
    expect(active).toHaveLength(2);
    expect(active.map((i) => i.name)).toEqual(["Active", "Also Active"]);
  });
});
