import { describe, it, expect } from "vitest";
import {
  reservationConfirmationEmail,
  reservationReminderEmail,
  orderConfirmationEmail,
  welcomeEmail,
  churnAlertEmail,
} from "@/lib/email-templates";

describe("reservationConfirmationEmail", () => {
  const data = {
    customerName: "Maria Silva",
    date: "2026-03-20",
    time: "19:30",
    guests: 4,
    table: "Mesa 5",
  };

  it("includes customer name", () => {
    const html = reservationConfirmationEmail(data);
    expect(html).toContain("Maria Silva");
  });

  it("includes reservation details", () => {
    const html = reservationConfirmationEmail(data);
    expect(html).toContain("2026-03-20");
    expect(html).toContain("19:30");
    expect(html).toContain("4");
    expect(html).toContain("Mesa 5");
  });

  it("includes confirmation heading", () => {
    const html = reservationConfirmationEmail(data);
    expect(html).toContain("Reserva Confirmada");
  });

  it("is valid HTML structure", () => {
    const html = reservationConfirmationEmail(data);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain("RestaurantCRM");
  });
});

describe("reservationReminderEmail", () => {
  it("includes reminder heading and customer name", () => {
    const html = reservationReminderEmail({
      customerName: "Joao Costa",
      date: "2026-03-21",
      time: "20:00",
      guests: 2,
    });
    expect(html).toContain("Lembrete de Reserva");
    expect(html).toContain("Joao Costa");
    expect(html).toContain("2026-03-21");
    expect(html).toContain("20:00");
  });

  it("mentions tomorrow in the message", () => {
    const html = reservationReminderEmail({
      customerName: "Ana",
      date: "2026-03-21",
      time: "19:00",
      guests: 1,
    });
    expect(html).toContain("amanhã");
  });
});

describe("orderConfirmationEmail", () => {
  const data = {
    customerName: "Pedro Santos",
    orderId: "ORD-001",
    items: [
      { name: "Picanha", quantity: 1, price: 89.9 },
      { name: "Caipirinha", quantity: 2, price: 18.5 },
    ],
    total: 126.9,
  };

  it("includes customer name and order ID", () => {
    const html = orderConfirmationEmail(data);
    expect(html).toContain("Pedro Santos");
    expect(html).toContain("ORD-001");
  });

  it("lists all items with quantities", () => {
    const html = orderConfirmationEmail(data);
    expect(html).toContain("1x Picanha");
    expect(html).toContain("2x Caipirinha");
  });

  it("calculates item subtotals correctly", () => {
    const html = orderConfirmationEmail(data);
    // 1 * 89.9 = 89,90
    expect(html).toContain("89,90");
    // 2 * 18.5 = 37,00
    expect(html).toContain("37,00");
  });

  it("formats total in BRL format (comma separator)", () => {
    const html = orderConfirmationEmail(data);
    expect(html).toContain("126,90");
  });

  it("includes order confirmation heading", () => {
    const html = orderConfirmationEmail(data);
    expect(html).toContain("Pedido Confirmado");
  });
});

describe("welcomeEmail", () => {
  it("includes welcome heading and customer name", () => {
    const html = welcomeEmail({ customerName: "Carlos" });
    expect(html).toContain("Bem-vindo");
    expect(html).toContain("Carlos");
  });

  it("mentions key features", () => {
    const html = welcomeEmail({ customerName: "Carlos" });
    expect(html).toContain("reservas");
    expect(html).toContain("pedidos");
    expect(html).toContain("fidelidade");
  });

  it("includes call-to-action button", () => {
    const html = welcomeEmail({ customerName: "Carlos" });
    expect(html).toContain("Acessar Sistema");
    expect(html).toContain('class="button"');
  });
});

describe("churnAlertEmail", () => {
  it("includes customer name and days since last visit", () => {
    const html = churnAlertEmail({
      customerName: "Ana Souza",
      lastVisit: "2026-01-15",
      daysSince: 59,
    });
    expect(html).toContain("Ana Souza");
    expect(html).toContain("59");
    expect(html).toContain("2026-01-15");
  });

  it("includes re-engagement message", () => {
    const html = churnAlertEmail({
      customerName: "Ana",
      lastVisit: "2026-01-01",
      daysSince: 30,
    });
    expect(html).toContain("Sentimos sua falta");
    expect(html).toContain("Fazer Reserva");
  });
});
