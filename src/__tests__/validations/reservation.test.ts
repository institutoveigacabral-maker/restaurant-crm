import { describe, it, expect } from "vitest";
import { reservationSchema } from "@/lib/validations/reservation";

describe("reservationSchema", () => {
  const valid = {
    customerId: 1,
    customerName: "Maria Silva",
    date: "2026-03-15",
    time: "19:30",
    guests: 4,
    table: "Mesa 5",
    status: "pending" as const,
    notes: "",
  };

  it("accepts valid reservation", () => {
    const result = reservationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      date: "15/03/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      time: "7:30 PM",
    });
    expect(result.success).toBe(false);
  });

  it("rejects 0 guests", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      guests: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects guests over 100", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      guests: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["pending", "confirmed", "cancelled", "completed"]) {
      const result = reservationSchema.safeParse({ ...valid, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty table", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      table: "",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string customerId to number", () => {
    const result = reservationSchema.safeParse({
      ...valid,
      customerId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBe(3);
    }
  });
});
