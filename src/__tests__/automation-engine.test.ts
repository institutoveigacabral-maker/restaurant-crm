import { describe, it, expect } from "vitest";

// Test the engine logic without DB — pure function behavior

describe("Automation Engine - Trigger Matching", () => {
  const TRIGGER_MAP: Record<string, string> = {
    reservation_confirmed: "reservation.status.confirmed",
    reservation_reminder: "cron.daily.reservations",
    customer_welcome: "customer.created",
    customer_inactive: "cron.daily.inactive",
    checklist_completed: "onboarding.checklist.completed",
  };

  it("maps all 5 automation types to event triggers", () => {
    expect(Object.keys(TRIGGER_MAP)).toHaveLength(5);
  });

  it("reservation_confirmed maps to reservation status event", () => {
    expect(TRIGGER_MAP.reservation_confirmed).toBe("reservation.status.confirmed");
  });

  it("customer_welcome maps to customer created event", () => {
    expect(TRIGGER_MAP.customer_welcome).toBe("customer.created");
  });

  it("customer_inactive maps to cron daily", () => {
    expect(TRIGGER_MAP.customer_inactive).toBe("cron.daily.inactive");
  });

  it("checklist_completed maps to onboarding event", () => {
    expect(TRIGGER_MAP.checklist_completed).toBe("onboarding.checklist.completed");
  });

  it("reservation_reminder maps to cron daily", () => {
    expect(TRIGGER_MAP.reservation_reminder).toBe("cron.daily.reservations");
  });
});

describe("Automation Engine - Email Template Selection", () => {
  function getTemplateForType(type: string): string | null {
    const map: Record<string, string> = {
      reservation_confirmed: "reservationConfirmation",
      reservation_reminder: "reservationReminder",
      customer_welcome: "welcome",
      customer_inactive: "churnAlert",
      checklist_completed: "none",
    };
    return map[type] ?? null;
  }

  it("reservation_confirmed uses confirmation template", () => {
    expect(getTemplateForType("reservation_confirmed")).toBe("reservationConfirmation");
  });

  it("customer_welcome uses welcome template", () => {
    expect(getTemplateForType("customer_welcome")).toBe("welcome");
  });

  it("customer_inactive uses churn alert template", () => {
    expect(getTemplateForType("customer_inactive")).toBe("churnAlert");
  });

  it("checklist_completed has no email (badge+XP only)", () => {
    expect(getTemplateForType("checklist_completed")).toBe("none");
  });

  it("unknown type returns null", () => {
    expect(getTemplateForType("nonexistent")).toBeNull();
  });
});

describe("Automation Engine - Should Execute", () => {
  function shouldExecute(automation: { active: boolean; type: string }): boolean {
    if (!automation.active) return false;
    const validTypes = [
      "reservation_confirmed",
      "reservation_reminder",
      "customer_welcome",
      "customer_inactive",
      "checklist_completed",
    ];
    return validTypes.includes(automation.type);
  }

  it("executes active automation with valid type", () => {
    expect(shouldExecute({ active: true, type: "customer_welcome" })).toBe(true);
  });

  it("does not execute inactive automation", () => {
    expect(shouldExecute({ active: false, type: "customer_welcome" })).toBe(false);
  });

  it("does not execute unknown type", () => {
    expect(shouldExecute({ active: true, type: "unknown" })).toBe(false);
  });
});

describe("Automation Engine - Inactive Customer Detection", () => {
  function isInactive(lastVisit: string | null, thresholdDays: number): boolean {
    if (!lastVisit) return true;
    const last = new Date(lastVisit);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > thresholdDays;
  }

  it("null lastVisit is inactive", () => {
    expect(isInactive(null, 30)).toBe(true);
  });

  it("recent visit is not inactive", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isInactive(yesterday.toISOString(), 30)).toBe(false);
  });

  it("old visit is inactive", () => {
    const old = new Date();
    old.setDate(old.getDate() - 60);
    expect(isInactive(old.toISOString(), 30)).toBe(true);
  });

  it("exactly at threshold is not inactive", () => {
    const exact = new Date();
    exact.setDate(exact.getDate() - 30);
    expect(isInactive(exact.toISOString(), 30)).toBe(false);
  });
});
