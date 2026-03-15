import { describe, it, expect } from "vitest";
import { reservationSchema, reservationUpdateSchema } from "@/lib/validations/reservation";

describe("reservationSchema — advanced edge cases", () => {
  const base = {
    customerId: 1,
    customerName: "Maria Silva",
    date: "2026-03-15",
    time: "19:30",
    guests: 4,
    table: "Mesa 5",
    status: "pending" as const,
    notes: "",
  };

  it("rejects notes longer than 500 characters", () => {
    const result = reservationSchema.safeParse({
      ...base,
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts notes of exactly 500 characters", () => {
    const result = reservationSchema.safeParse({
      ...base,
      notes: "x".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimum 1 guest", () => {
    const result = reservationSchema.safeParse({
      ...base,
      guests: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts maximum 100 guests", () => {
    const result = reservationSchema.safeParse({
      ...base,
      guests: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative guests", () => {
    const result = reservationSchema.safeParse({
      ...base,
      guests: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric customerId strings", () => {
    const result = reservationSchema.safeParse({
      ...base,
      customerId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects date with wrong format (DD-MM-YYYY)", () => {
    const result = reservationSchema.safeParse({
      ...base,
      date: "15-03-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects time with seconds (HH:MM:SS)", () => {
    const result = reservationSchema.safeParse({
      ...base,
      time: "19:30:00",
    });
    expect(result.success).toBe(false);
  });

  it("accepts time 00:00", () => {
    const result = reservationSchema.safeParse({
      ...base,
      time: "00:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts time 23:59", () => {
    const result = reservationSchema.safeParse({
      ...base,
      time: "23:59",
    });
    expect(result.success).toBe(true);
  });

  it("defaults notes to empty string when omitted", () => {
    const { notes, ...withoutNotes } = base;
    const result = reservationSchema.parse(withoutNotes);
    expect(result.notes).toBe("");
  });

  it("defaults status to pending when omitted", () => {
    const { status, ...withoutStatus } = base;
    const result = reservationSchema.parse(withoutStatus);
    expect(result.status).toBe("pending");
  });
});

describe("reservationUpdateSchema", () => {
  const base = {
    id: 1,
    customerId: 1,
    customerName: "Maria Silva",
    date: "2026-03-15",
    time: "19:30",
    guests: 4,
    table: "Mesa 5",
    status: "confirmed" as const,
    notes: "",
  };

  it("accepts valid update with id", () => {
    const result = reservationUpdateSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects update without id", () => {
    const { id, ...withoutId } = base;
    const result = reservationUpdateSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("coerces string id", () => {
    const result = reservationUpdateSchema.safeParse({
      ...base,
      id: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it("rejects negative id", () => {
    const result = reservationUpdateSchema.safeParse({
      ...base,
      id: -1,
    });
    expect(result.success).toBe(false);
  });
});
