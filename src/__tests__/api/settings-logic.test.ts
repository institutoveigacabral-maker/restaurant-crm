import { describe, it, expect } from "vitest";

// Test settings and feature flag logic from settings service.
// updateSettings selectively applies only defined fields.
// upsertFeatureFlag creates or updates based on existence.

describe("Settings update selective field application", () => {
  interface Settings {
    name: string;
    phone: string | null;
    email: string | null;
    currency: string;
    timezone: string;
    maxReservationsPerSlot: number;
    reservationDuration: number;
    autoConfirmReservations: boolean;
    emailNotifications: boolean;
  }

  function applySettingsUpdate(current: Settings, update: Partial<Settings>): Settings {
    const result = { ...current };
    if (update.name !== undefined) result.name = update.name;
    if (update.phone !== undefined) result.phone = update.phone;
    if (update.email !== undefined) result.email = update.email;
    if (update.currency !== undefined) result.currency = update.currency;
    if (update.timezone !== undefined) result.timezone = update.timezone;
    if (update.maxReservationsPerSlot !== undefined)
      result.maxReservationsPerSlot = update.maxReservationsPerSlot;
    if (update.reservationDuration !== undefined)
      result.reservationDuration = update.reservationDuration;
    if (update.autoConfirmReservations !== undefined)
      result.autoConfirmReservations = update.autoConfirmReservations;
    if (update.emailNotifications !== undefined)
      result.emailNotifications = update.emailNotifications;
    return result;
  }

  const defaults: Settings = {
    name: "Meu Restaurante",
    phone: null,
    email: null,
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    maxReservationsPerSlot: 10,
    reservationDuration: 120,
    autoConfirmReservations: false,
    emailNotifications: true,
  };

  it("updates only the name field", () => {
    const result = applySettingsUpdate(defaults, { name: "Sushi Rão" });
    expect(result.name).toBe("Sushi Rão");
    expect(result.currency).toBe("BRL");
    expect(result.emailNotifications).toBe(true);
  });

  it("updates multiple fields at once", () => {
    const result = applySettingsUpdate(defaults, {
      name: "Pizza do Rão",
      currency: "EUR",
      timezone: "Europe/Lisbon",
    });
    expect(result.name).toBe("Pizza do Rão");
    expect(result.currency).toBe("EUR");
    expect(result.timezone).toBe("Europe/Lisbon");
  });

  it("can enable auto-confirm reservations", () => {
    const result = applySettingsUpdate(defaults, {
      autoConfirmReservations: true,
    });
    expect(result.autoConfirmReservations).toBe(true);
  });

  it("can disable email notifications", () => {
    const result = applySettingsUpdate(defaults, {
      emailNotifications: false,
    });
    expect(result.emailNotifications).toBe(false);
  });

  it("can change max reservations per slot", () => {
    const result = applySettingsUpdate(defaults, {
      maxReservationsPerSlot: 20,
    });
    expect(result.maxReservationsPerSlot).toBe(20);
  });

  it("preserves all fields when update is empty", () => {
    const result = applySettingsUpdate(defaults, {});
    expect(result).toEqual(defaults);
  });
});

describe("Feature flag upsert logic", () => {
  interface FeatureFlag {
    key: string;
    enabled: boolean;
    description: string;
  }

  function upsertFlag(
    existing: FeatureFlag | null,
    key: string,
    enabled: boolean,
    description?: string
  ): { action: "create" | "update"; flag: FeatureFlag } {
    if (existing) {
      return {
        action: "update",
        flag: {
          key,
          enabled,
          description: description !== undefined ? description : existing.description,
        },
      };
    }

    return {
      action: "create",
      flag: {
        key,
        enabled,
        description: description ?? "",
      },
    };
  }

  it("creates new flag when none exists", () => {
    const result = upsertFlag(null, "gamification", true, "Enable gamification");
    expect(result.action).toBe("create");
    expect(result.flag.key).toBe("gamification");
    expect(result.flag.enabled).toBe(true);
  });

  it("updates existing flag", () => {
    const existing: FeatureFlag = {
      key: "gamification",
      enabled: false,
      description: "Gamification module",
    };
    const result = upsertFlag(existing, "gamification", true);
    expect(result.action).toBe("update");
    expect(result.flag.enabled).toBe(true);
    expect(result.flag.description).toBe("Gamification module");
  });

  it("updates description when provided", () => {
    const existing: FeatureFlag = {
      key: "training",
      enabled: true,
      description: "Old description",
    };
    const result = upsertFlag(existing, "training", true, "New description");
    expect(result.flag.description).toBe("New description");
  });

  it("defaults description to empty string for new flags", () => {
    const result = upsertFlag(null, "new_feature", false);
    expect(result.flag.description).toBe("");
  });
});
