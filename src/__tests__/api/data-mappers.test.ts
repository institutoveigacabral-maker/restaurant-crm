import { describe, it, expect } from "vitest";

// Test the data mapper functions from lib/api.ts
// These are the pure functions that transform raw DB data into frontend types.
// We recreate them here since importing from api.ts pulls in 'sonner' which needs DOM.

// Reproducing the exact mapper logic from src/lib/api.ts

interface RawCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  visits: number;
  total_spent: string;
  last_visit: string | null;
  notes: string;
  tags: string[];
  created_at: string;
}

function mapCustomer(c: RawCustomer) {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email,
    phone: c.phone,
    visits: c.visits ?? 0,
    totalSpent: Number(c.total_spent ?? 0),
    lastVisit: c.last_visit ? String(c.last_visit).split("T")[0] : "",
    notes: c.notes || "",
    tags: c.tags || [],
    createdAt: c.created_at ? String(c.created_at).split("T")[0] : "",
  };
}

interface RawReservation {
  id: number;
  customer_id: number;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  table_name: string;
  status: string;
  notes: string;
}

function mapReservation(r: RawReservation) {
  return {
    id: String(r.id),
    customerId: String(r.customer_id),
    customerName: r.customer_name,
    date: r.date ? String(r.date).split("T")[0] : "",
    time: r.time,
    guests: r.guests,
    table: r.table_name,
    status: r.status,
    notes: r.notes || "",
  };
}

interface RawOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  items: unknown;
  total: string;
  date: string;
  status: string;
}

function mapOrder(o: RawOrder) {
  return {
    id: String(o.id),
    customerId: String(o.customer_id),
    customerName: o.customer_name,
    items: (typeof o.items === "string" ? JSON.parse(o.items) : o.items) as unknown[],
    total: Number(o.total),
    date: o.date ? String(o.date).split("T")[0] : "",
    status: o.status,
  };
}

interface RawMenuCategory {
  id: number;
  name: string;
  description: string;
  sort_order: number;
}

function mapCategory(c: RawMenuCategory) {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description || "",
    sortOrder: c.sort_order ?? 0,
  };
}

interface RawMenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string | null;
}

function mapMenuItem(m: RawMenuItem) {
  return {
    id: String(m.id),
    categoryId: String(m.category_id),
    name: m.name,
    description: m.description || "",
    price: Number(m.price),
    available: m.available ?? true,
    image: m.image,
  };
}

describe("mapCustomer", () => {
  it("transforms raw customer to frontend Customer type", () => {
    const raw: RawCustomer = {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-1234",
      visits: 5,
      total_spent: "450.50",
      last_visit: "2026-03-10T00:00:00.000Z",
      notes: "VIP customer",
      tags: ["VIP", "Frequente"],
      created_at: "2025-01-01T00:00:00.000Z",
    };

    const result = mapCustomer(raw);

    expect(result.id).toBe("1");
    expect(result.name).toBe("Maria Silva");
    expect(result.totalSpent).toBe(450.5);
    expect(result.lastVisit).toBe("2026-03-10");
    expect(result.createdAt).toBe("2025-01-01");
    expect(result.tags).toEqual(["VIP", "Frequente"]);
  });

  it("handles null last_visit", () => {
    const raw: RawCustomer = {
      id: 2,
      name: "Joao",
      email: "joao@email.com",
      phone: "12345678",
      visits: 0,
      total_spent: "0",
      last_visit: null,
      notes: "",
      tags: [],
      created_at: "2025-06-01T00:00:00.000Z",
    };

    const result = mapCustomer(raw);
    expect(result.lastVisit).toBe("");
    expect(result.visits).toBe(0);
    expect(result.totalSpent).toBe(0);
  });

  it("defaults visits to 0 when undefined", () => {
    const raw = {
      id: 3,
      name: "Test",
      email: "t@e.com",
      phone: "12345678",
      visits: undefined as unknown as number,
      total_spent: "100",
      last_visit: null,
      notes: "",
      tags: [],
      created_at: "2025-01-01",
    };

    const result = mapCustomer(raw as RawCustomer);
    expect(result.visits).toBe(0);
  });
});

describe("mapReservation", () => {
  it("transforms raw reservation to frontend Reservation type", () => {
    const raw: RawReservation = {
      id: 10,
      customer_id: 1,
      customer_name: "Maria Silva",
      date: "2026-03-20T00:00:00.000Z",
      time: "19:30",
      guests: 4,
      table_name: "Mesa 5",
      status: "confirmed",
      notes: "Aniversario",
    };

    const result = mapReservation(raw);
    expect(result.id).toBe("10");
    expect(result.customerId).toBe("1");
    expect(result.date).toBe("2026-03-20");
    expect(result.table).toBe("Mesa 5");
    expect(result.status).toBe("confirmed");
    expect(result.notes).toBe("Aniversario");
  });

  it("handles empty notes", () => {
    const raw: RawReservation = {
      id: 11,
      customer_id: 2,
      customer_name: "Joao",
      date: "2026-04-01",
      time: "20:00",
      guests: 2,
      table_name: "Mesa 1",
      status: "pending",
      notes: "",
    };

    const result = mapReservation(raw);
    expect(result.notes).toBe("");
  });
});

describe("mapOrder", () => {
  it("transforms raw order with array items", () => {
    const raw: RawOrder = {
      id: 100,
      customer_id: 1,
      customer_name: "Pedro",
      items: [{ name: "Picanha", quantity: 1, price: 89.9 }],
      total: "89.90",
      date: "2026-03-15T00:00:00.000Z",
      status: "preparing",
    };

    const result = mapOrder(raw);
    expect(result.id).toBe("100");
    expect(result.total).toBe(89.9);
    expect(result.items).toHaveLength(1);
    expect(result.date).toBe("2026-03-15");
  });

  it("parses stringified JSON items", () => {
    const raw: RawOrder = {
      id: 101,
      customer_id: 2,
      customer_name: "Ana",
      items: JSON.stringify([{ name: "Suco", quantity: 2, price: 12 }]),
      total: "24.00",
      date: "2026-03-15",
      status: "served",
    };

    const result = mapOrder(raw);
    expect(result.items).toHaveLength(1);
    expect((result.items[0] as { name: string }).name).toBe("Suco");
  });
});

describe("mapCategory", () => {
  it("transforms raw category", () => {
    const raw: RawMenuCategory = {
      id: 1,
      name: "Entradas",
      description: "Aperitivos e saladas",
      sort_order: 1,
    };

    const result = mapCategory(raw);
    expect(result.id).toBe("1");
    expect(result.name).toBe("Entradas");
    expect(result.sortOrder).toBe(1);
  });

  it("defaults empty description", () => {
    const raw: RawMenuCategory = {
      id: 2,
      name: "Sobremesas",
      description: "",
      sort_order: 5,
    };

    const result = mapCategory(raw);
    expect(result.description).toBe("");
  });
});

describe("mapMenuItem", () => {
  it("transforms raw menu item", () => {
    const raw: RawMenuItem = {
      id: 50,
      category_id: 1,
      name: "Picanha na Brasa",
      description: "200g servida com arroz e farofa",
      price: "89.90",
      available: true,
      image: "/images/picanha.jpg",
    };

    const result = mapMenuItem(raw);
    expect(result.id).toBe("50");
    expect(result.categoryId).toBe("1");
    expect(result.price).toBe(89.9);
    expect(result.available).toBe(true);
    expect(result.image).toBe("/images/picanha.jpg");
  });

  it("handles null image", () => {
    const raw: RawMenuItem = {
      id: 51,
      category_id: 2,
      name: "Agua",
      description: "",
      price: "5.00",
      available: true,
      image: null,
    };

    const result = mapMenuItem(raw);
    expect(result.image).toBeNull();
  });

  it("defaults available to true when undefined", () => {
    const raw = {
      id: 52,
      category_id: 1,
      name: "Test",
      description: "",
      price: "10.00",
      available: undefined as unknown as boolean,
      image: null,
    };

    const result = mapMenuItem(raw as RawMenuItem);
    expect(result.available).toBe(true);
  });
});
