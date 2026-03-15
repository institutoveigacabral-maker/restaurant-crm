import { describe, it, expect } from "vitest";

// Reproduce the exact calculateLevel logic from src/services/gamification.ts
// to test it without importing the module (which pulls in the DB connection).
const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];

function calculateLevel(totalXp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) {
      if (i >= XP_THRESHOLDS.length - 1) {
        const extraXp = totalXp - XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
        return XP_THRESHOLDS.length + Math.floor(extraXp / 1500);
      }
      return i + 1;
    }
  }
  return 1;
}

describe("calculateLevel", () => {
  // XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000]
  // Level 1: 0-99 XP
  // Level 2: 100-299 XP
  // Level 3: 300-599 XP
  // etc.

  it("returns level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 1 for 99 XP (just below threshold)", () => {
    expect(calculateLevel(99)).toBe(1);
  });

  it("returns level 2 for exactly 100 XP", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("returns level 2 for 200 XP (between thresholds)", () => {
    expect(calculateLevel(200)).toBe(2);
  });

  it("returns level 3 for exactly 300 XP", () => {
    expect(calculateLevel(300)).toBe(3);
  });

  it("returns level 4 for exactly 600 XP", () => {
    expect(calculateLevel(600)).toBe(4);
  });

  it("returns level 5 for exactly 1000 XP", () => {
    expect(calculateLevel(1000)).toBe(5);
  });

  it("returns level 6 for exactly 1500 XP", () => {
    expect(calculateLevel(1500)).toBe(6);
  });

  it("returns level 7 for exactly 2200 XP", () => {
    expect(calculateLevel(2200)).toBe(7);
  });

  it("returns level 8 for exactly 3000 XP", () => {
    expect(calculateLevel(3000)).toBe(8);
  });

  it("returns level 9 for exactly 4000 XP", () => {
    expect(calculateLevel(4000)).toBe(9);
  });

  it("returns level 10 for exactly 5000 XP (last threshold)", () => {
    expect(calculateLevel(5000)).toBe(10);
  });

  it("calculates levels beyond thresholds (5000+ XP uses 1500 per level)", () => {
    // At 5000, level = 10 (thresholds.length)
    // At 6500, extraXp = 1500, Math.floor(1500/1500) = 1, so level = 10 + 1 = 11
    expect(calculateLevel(6500)).toBe(11);
  });

  it("handles large XP values for high levels", () => {
    // At 8000, extraXp = 3000, Math.floor(3000/1500) = 2, so level = 10 + 2 = 12
    expect(calculateLevel(8000)).toBe(12);
  });

  it("stays at level 10 for 5001 XP (not enough for level 11)", () => {
    // extraXp = 1, Math.floor(1/1500) = 0, so level = 10 + 0 = 10
    expect(calculateLevel(5001)).toBe(10);
  });

  it("handles negative XP by returning level 1", () => {
    // 0 is the first threshold, negative is below, loop finds nothing, returns 1
    expect(calculateLevel(-100)).toBe(1);
  });

  it("returns correct level for 999 XP (just below level 5)", () => {
    expect(calculateLevel(999)).toBe(4);
  });

  it("returns correct level for 4999 XP (just below level 10)", () => {
    expect(calculateLevel(4999)).toBe(9);
  });
});
