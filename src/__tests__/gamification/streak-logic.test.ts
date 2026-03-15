import { describe, it, expect, vi, afterEach } from "vitest";

// Test the streak calculation logic from gamification service.
// The updateStreak function logic:
// - If no lastActivityDate: newStreak = 1
// - If lastActivityDate == today: return (no update, same day)
// - If lastActivityDate == yesterday: streak + 1
// - If lastActivityDate > 1 day ago: reset streak to 1

function calculateStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  todayStr: string
): { newStreak: number; shouldUpdate: boolean } {
  if (!lastActivityDate) {
    return { newStreak: 1, shouldUpdate: true };
  }

  const lastDate = new Date(lastActivityDate);
  const todayDate = new Date(todayStr);
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, no update needed
    return { newStreak: currentStreak, shouldUpdate: false };
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    return { newStreak: currentStreak + 1, shouldUpdate: true };
  } else {
    // Streak broken, reset to 1
    return { newStreak: 1, shouldUpdate: true };
  }
}

describe("Streak calculation logic", () => {
  it("starts streak at 1 for first activity (no lastActivityDate)", () => {
    const result = calculateStreak(0, null, "2026-03-15");
    expect(result.newStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it("does not update streak on same day activity", () => {
    const result = calculateStreak(5, "2026-03-15", "2026-03-15");
    expect(result.newStreak).toBe(5);
    expect(result.shouldUpdate).toBe(false);
  });

  it("increments streak for consecutive day", () => {
    const result = calculateStreak(3, "2026-03-14", "2026-03-15");
    expect(result.newStreak).toBe(4);
    expect(result.shouldUpdate).toBe(true);
  });

  it("resets streak to 1 after 2 days gap", () => {
    const result = calculateStreak(10, "2026-03-13", "2026-03-15");
    expect(result.newStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it("resets streak to 1 after a week gap", () => {
    const result = calculateStreak(30, "2026-03-08", "2026-03-15");
    expect(result.newStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it("handles month boundary correctly", () => {
    // Feb 28 to Mar 1 = 1 day
    const result = calculateStreak(5, "2026-02-28", "2026-03-01");
    expect(result.newStreak).toBe(6);
    expect(result.shouldUpdate).toBe(true);
  });

  it("handles year boundary correctly", () => {
    // Dec 31 to Jan 1 = 1 day
    const result = calculateStreak(100, "2025-12-31", "2026-01-01");
    expect(result.newStreak).toBe(101);
    expect(result.shouldUpdate).toBe(true);
  });

  it("handles long consecutive streak", () => {
    const result = calculateStreak(364, "2026-03-14", "2026-03-15");
    expect(result.newStreak).toBe(365);
    expect(result.shouldUpdate).toBe(true);
  });
});
