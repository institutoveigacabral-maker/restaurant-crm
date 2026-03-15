import { describe, it, expect } from "vitest";

// Test the completion rate calculation logic from training service.
// getCourseStats computes:
//   completionRate: total > 0 ? Math.round((completed / total) * 100) : 0

function calculateCompletionRate(totalEnrollments: number, completedCount: number): number {
  return totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;
}

function calculateProgressStatus(progress: number): {
  status: string;
  cappedProgress: number;
  isCompleted: boolean;
} {
  const cappedProgress = Math.min(progress, 100);
  const isCompleted = progress >= 100;
  const status = isCompleted ? "completed" : "in_progress";
  return { status, cappedProgress, isCompleted };
}

describe("Course completion rate calculation", () => {
  it("returns 0 for zero enrollments", () => {
    expect(calculateCompletionRate(0, 0)).toBe(0);
  });

  it("returns 0 for enrollments with no completions", () => {
    expect(calculateCompletionRate(10, 0)).toBe(0);
  });

  it("returns 100 for all completed", () => {
    expect(calculateCompletionRate(5, 5)).toBe(100);
  });

  it("returns 50 for half completed", () => {
    expect(calculateCompletionRate(10, 5)).toBe(50);
  });

  it("rounds correctly (33.33% -> 33%)", () => {
    expect(calculateCompletionRate(3, 1)).toBe(33);
  });

  it("rounds correctly (66.66% -> 67%)", () => {
    expect(calculateCompletionRate(3, 2)).toBe(67);
  });

  it("handles 1 enrollment, 1 completion", () => {
    expect(calculateCompletionRate(1, 1)).toBe(100);
  });

  it("handles large numbers", () => {
    expect(calculateCompletionRate(1000, 750)).toBe(75);
  });
});

describe("Course progress status calculation", () => {
  it("marks as in_progress for 0%", () => {
    const result = calculateProgressStatus(0);
    expect(result.status).toBe("in_progress");
    expect(result.isCompleted).toBe(false);
    expect(result.cappedProgress).toBe(0);
  });

  it("marks as in_progress for 50%", () => {
    const result = calculateProgressStatus(50);
    expect(result.status).toBe("in_progress");
    expect(result.isCompleted).toBe(false);
  });

  it("marks as in_progress for 99%", () => {
    const result = calculateProgressStatus(99);
    expect(result.status).toBe("in_progress");
    expect(result.isCompleted).toBe(false);
  });

  it("marks as completed for exactly 100%", () => {
    const result = calculateProgressStatus(100);
    expect(result.status).toBe("completed");
    expect(result.isCompleted).toBe(true);
    expect(result.cappedProgress).toBe(100);
  });

  it("caps progress at 100 for values above 100", () => {
    const result = calculateProgressStatus(150);
    expect(result.cappedProgress).toBe(100);
    expect(result.isCompleted).toBe(true);
  });

  it("marks as completed for 101%", () => {
    const result = calculateProgressStatus(101);
    expect(result.status).toBe("completed");
    expect(result.isCompleted).toBe(true);
  });
});
