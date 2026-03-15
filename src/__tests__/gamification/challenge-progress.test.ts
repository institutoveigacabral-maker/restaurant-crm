import { describe, it, expect } from "vitest";

// Test the challenge progress evaluation logic from challenges service.
// The updateProgress function checks:
//   const goal = challenge.goal as { type: string; target: number };
//   const isCompleted = progress >= goal.target;

interface ChallengeGoal {
  type: string;
  target: number;
}

function evaluateChallengeProgress(
  currentProgress: number,
  goal: ChallengeGoal,
  isAlreadyCompleted: boolean
): { isCompleted: boolean; shouldAwardXp: boolean } {
  if (isAlreadyCompleted) {
    return { isCompleted: true, shouldAwardXp: false };
  }

  const completed = currentProgress >= goal.target;
  return {
    isCompleted: completed,
    shouldAwardXp: completed,
  };
}

describe("Challenge progress evaluation", () => {
  describe("completion check", () => {
    it("marks as completed when progress equals target", () => {
      const result = evaluateChallengeProgress(10, { type: "orders", target: 10 }, false);
      expect(result.isCompleted).toBe(true);
      expect(result.shouldAwardXp).toBe(true);
    });

    it("marks as completed when progress exceeds target", () => {
      const result = evaluateChallengeProgress(15, { type: "orders", target: 10 }, false);
      expect(result.isCompleted).toBe(true);
      expect(result.shouldAwardXp).toBe(true);
    });

    it("does not mark as completed when progress is below target", () => {
      const result = evaluateChallengeProgress(5, { type: "orders", target: 10 }, false);
      expect(result.isCompleted).toBe(false);
      expect(result.shouldAwardXp).toBe(false);
    });

    it("does not re-award XP for already completed challenges", () => {
      const result = evaluateChallengeProgress(10, { type: "orders", target: 10 }, true);
      expect(result.isCompleted).toBe(true);
      expect(result.shouldAwardXp).toBe(false);
    });
  });

  describe("different goal types", () => {
    it("works for courses goal type", () => {
      const result = evaluateChallengeProgress(3, { type: "courses", target: 3 }, false);
      expect(result.isCompleted).toBe(true);
    });

    it("works for reservations goal type", () => {
      const result = evaluateChallengeProgress(20, { type: "reservations", target: 50 }, false);
      expect(result.isCompleted).toBe(false);
    });

    it("works for score goal type", () => {
      const result = evaluateChallengeProgress(85, { type: "avg_score", target: 80 }, false);
      expect(result.isCompleted).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles zero progress and zero target", () => {
      const result = evaluateChallengeProgress(0, { type: "orders", target: 0 }, false);
      expect(result.isCompleted).toBe(true);
    });

    it("handles large targets", () => {
      const result = evaluateChallengeProgress(999, { type: "orders", target: 1000 }, false);
      expect(result.isCompleted).toBe(false);
    });

    it("handles progress of exactly 1 for target 1", () => {
      const result = evaluateChallengeProgress(1, { type: "logins", target: 1 }, false);
      expect(result.isCompleted).toBe(true);
    });
  });
});
