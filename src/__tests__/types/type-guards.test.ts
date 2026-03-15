import { describe, it, expect } from "vitest";
import type { Customer, Reservation, Order, OrderItem, MenuItem, MenuCategory } from "@/types";

// Test type consistency and interface contracts.
// These tests verify that objects conforming to the types have the expected shape.

describe("Customer type contract", () => {
  const customer: Customer = {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1234",
    visits: 5,
    totalSpent: 450.5,
    lastVisit: "2026-03-10",
    notes: "VIP customer",
    tags: ["VIP", "Frequente"],
    createdAt: "2025-01-01",
  };

  it("has all required fields", () => {
    expect(customer).toHaveProperty("id");
    expect(customer).toHaveProperty("name");
    expect(customer).toHaveProperty("email");
    expect(customer).toHaveProperty("phone");
    expect(customer).toHaveProperty("visits");
    expect(customer).toHaveProperty("totalSpent");
    expect(customer).toHaveProperty("lastVisit");
    expect(customer).toHaveProperty("notes");
    expect(customer).toHaveProperty("tags");
    expect(customer).toHaveProperty("createdAt");
  });

  it("has correct field types", () => {
    expect(typeof customer.id).toBe("string");
    expect(typeof customer.name).toBe("string");
    expect(typeof customer.visits).toBe("number");
    expect(typeof customer.totalSpent).toBe("number");
    expect(Array.isArray(customer.tags)).toBe(true);
  });
});

describe("Reservation type contract", () => {
  it("status must be one of the valid values", () => {
    const validStatuses: Reservation["status"][] = [
      "confirmed",
      "pending",
      "cancelled",
      "completed",
    ];
    expect(validStatuses).toHaveLength(4);

    const reservation: Reservation = {
      id: "1",
      customerId: "1",
      customerName: "Maria",
      date: "2026-03-20",
      time: "19:30",
      guests: 4,
      table: "Mesa 5",
      status: "confirmed",
      notes: "",
    };

    expect(validStatuses).toContain(reservation.status);
  });
});

describe("Order type contract", () => {
  it("status must be one of the valid values", () => {
    const validStatuses: Order["status"][] = ["preparing", "served", "paid", "cancelled"];
    expect(validStatuses).toHaveLength(4);
  });

  it("items array contains OrderItem objects", () => {
    const items: OrderItem[] = [
      { name: "Picanha", quantity: 1, price: 89.9 },
      { name: "Caipirinha", quantity: 2, price: 18.5 },
    ];

    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("quantity");
    expect(items[0]).toHaveProperty("price");
    expect(typeof items[0].quantity).toBe("number");
    expect(typeof items[0].price).toBe("number");
  });

  it("order total should match sum of items", () => {
    const items: OrderItem[] = [
      { name: "Picanha", quantity: 1, price: 89.9 },
      { name: "Caipirinha", quantity: 2, price: 18.5 },
    ];

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(total).toBeCloseTo(126.9, 2);
  });
});

describe("MenuItem type contract", () => {
  it("has all required fields", () => {
    const item: MenuItem = {
      id: "1",
      categoryId: "1",
      name: "Picanha na Brasa",
      description: "200g com acompanhamentos",
      price: 89.9,
      available: true,
      image: null,
    };

    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("categoryId");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("price");
    expect(item).toHaveProperty("available");
    expect(item).toHaveProperty("image");
  });

  it("image can be null", () => {
    const item: MenuItem = {
      id: "1",
      categoryId: "1",
      name: "Test",
      description: "",
      price: 10,
      available: true,
      image: null,
    };
    expect(item.image).toBeNull();
  });

  it("image can be a string URL", () => {
    const item: MenuItem = {
      id: "1",
      categoryId: "1",
      name: "Test",
      description: "",
      price: 10,
      available: true,
      image: "/images/test.jpg",
    };
    expect(typeof item.image).toBe("string");
  });
});

describe("MenuCategory type contract", () => {
  it("has sortOrder for ordering categories", () => {
    const categories: MenuCategory[] = [
      { id: "1", name: "Entradas", description: "", sortOrder: 1 },
      { id: "2", name: "Pratos Principais", description: "", sortOrder: 2 },
      { id: "3", name: "Sobremesas", description: "", sortOrder: 3 },
    ];

    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted[0].name).toBe("Entradas");
    expect(sorted[2].name).toBe("Sobremesas");
  });
});
