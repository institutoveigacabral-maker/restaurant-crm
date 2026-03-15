import { describe, it, expect } from "vitest";

// Test the badge criteria evaluation logic from gamification service.
// The checkAndAwardBadges function uses this pattern:
//
// criteria: { type: string, value: number }
// Stats: { courses_completed, level, streak, total_xp, all_mandatory_completed }
//
// We extract and test this logic in isolation.

interface BadgeCriteria {
  type: string;
  value: number;
}

interface UserStats {
  courses_completed: number;
  level: number;
  streak: number;
  total_xp: number;
  all_mandatory_completed: boolean;
}

function evaluateCriteria(criteria: BadgeCriteria | null, stats: UserStats): boolean {
  if (!criteria) return false;

  switch (criteria.type) {
    case "courses_completed":
      return stats.courses_completed >= criteria.value;
    case "level":
      return stats.level >= criteria.value;
    case "streak":
      return stats.streak >= criteria.value;
    case "total_xp":
      return stats.total_xp >= criteria.value;
    case "all_mandatory_completed":
      return stats.all_mandatory_completed;
    default:
      return false;
  }
}

describe("Badge criteria evaluation", () => {
  const baseStats: UserStats = {
    courses_completed: 5,
    level: 3,
    streak: 7,
    total_xp: 500,
    all_mandatory_completed: false,
  };

  describe("courses_completed criteria", () => {
    it("awards when user has completed enough courses", () => {
      expect(evaluateCriteria({ type: "courses_completed", value: 5 }, baseStats)).toBe(true);
    });

    it("awards when user has more than required", () => {
      expect(evaluateCriteria({ type: "courses_completed", value: 3 }, baseStats)).toBe(true);
    });

    it("does not award when user has fewer courses", () => {
      expect(evaluateCriteria({ type: "courses_completed", value: 10 }, baseStats)).toBe(false);
    });
  });

  describe("level criteria", () => {
    it("awards when user reaches required level", () => {
      expect(evaluateCriteria({ type: "level", value: 3 }, baseStats)).toBe(true);
    });

    it("does not award when level is below required", () => {
      expect(evaluateCriteria({ type: "level", value: 5 }, baseStats)).toBe(false);
    });
  });

  describe("streak criteria", () => {
    it("awards when streak meets requirement", () => {
      expect(evaluateCriteria({ type: "streak", value: 7 }, baseStats)).toBe(true);
    });

    it("awards when streak exceeds requirement", () => {
      expect(evaluateCriteria({ type: "streak", value: 5 }, baseStats)).toBe(true);
    });

    it("does not award when streak is below requirement", () => {
      expect(evaluateCriteria({ type: "streak", value: 14 }, baseStats)).toBe(false);
    });
  });

  describe("total_xp criteria", () => {
    it("awards when XP meets threshold", () => {
      expect(evaluateCriteria({ type: "total_xp", value: 500 }, baseStats)).toBe(true);
    });

    it("does not award when XP is below threshold", () => {
      expect(evaluateCriteria({ type: "total_xp", value: 1000 }, baseStats)).toBe(false);
    });
  });

  describe("all_mandatory_completed criteria", () => {
    it("awards when all mandatory courses are completed", () => {
      const stats = { ...baseStats, all_mandatory_completed: true };
      expect(evaluateCriteria({ type: "all_mandatory_completed", value: 0 }, stats)).toBe(true);
    });

    it("does not award when mandatory courses are incomplete", () => {
      expect(evaluateCriteria({ type: "all_mandatory_completed", value: 0 }, baseStats)).toBe(
        false
      );
    });
  });

  describe("edge cases", () => {
    it("returns false for null criteria", () => {
      expect(evaluateCriteria(null, baseStats)).toBe(false);
    });

    it("returns false for unknown criteria type", () => {
      expect(evaluateCriteria({ type: "unknown_type", value: 1 }, baseStats)).toBe(false);
    });

    it("awards for zero value (always true for >= comparisons)", () => {
      expect(evaluateCriteria({ type: "courses_completed", value: 0 }, baseStats)).toBe(true);
    });
  });
});
