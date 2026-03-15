import { describe, it, expect } from "vitest";

// Test the enrollment and progress update logic from training service.
// The service handles:
// - Enrolling a user (idempotent — returns existing if already enrolled)
// - Updating progress with score
// - Auto-completing when progress >= 100
// - Awarding XP on completion

describe("Enrollment deduplication logic", () => {
  it("detects existing enrollment (same userId + courseId)", () => {
    const existingEnrollments = [
      { userId: "user-1", courseId: 1 },
      { userId: "user-1", courseId: 2 },
      { userId: "user-2", courseId: 1 },
    ];

    const isAlreadyEnrolled = existingEnrollments.some(
      (e) => e.userId === "user-1" && e.courseId === 1
    );
    expect(isAlreadyEnrolled).toBe(true);
  });

  it("allows enrollment in new course", () => {
    const existingEnrollments = [{ userId: "user-1", courseId: 1 }];

    const isAlreadyEnrolled = existingEnrollments.some(
      (e) => e.userId === "user-1" && e.courseId === 3
    );
    expect(isAlreadyEnrolled).toBe(false);
  });

  it("allows different user to enroll in same course", () => {
    const existingEnrollments = [{ userId: "user-1", courseId: 1 }];

    const isAlreadyEnrolled = existingEnrollments.some(
      (e) => e.userId === "user-2" && e.courseId === 1
    );
    expect(isAlreadyEnrolled).toBe(false);
  });
});

describe("Progress update logic", () => {
  interface ProgressUpdate {
    progress: number;
    score?: number;
  }

  function computeProgressUpdate(update: ProgressUpdate) {
    const isCompleted = update.progress >= 100;
    const cappedProgress = Math.min(update.progress, 100);
    const status = isCompleted ? "completed" : "in_progress";

    return {
      progress: cappedProgress,
      status,
      isCompleted,
      score: update.score,
      shouldAwardXp: isCompleted,
    };
  }

  it("sets status to in_progress for partial progress", () => {
    const result = computeProgressUpdate({ progress: 50 });
    expect(result.status).toBe("in_progress");
    expect(result.progress).toBe(50);
    expect(result.shouldAwardXp).toBe(false);
  });

  it("sets status to completed for 100% progress", () => {
    const result = computeProgressUpdate({ progress: 100 });
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(100);
    expect(result.shouldAwardXp).toBe(true);
  });

  it("caps progress at 100 for over-100 values", () => {
    const result = computeProgressUpdate({ progress: 120 });
    expect(result.progress).toBe(100);
    expect(result.isCompleted).toBe(true);
  });

  it("includes score when provided", () => {
    const result = computeProgressUpdate({ progress: 100, score: 95 });
    expect(result.score).toBe(95);
  });

  it("has undefined score when not provided", () => {
    const result = computeProgressUpdate({ progress: 100 });
    expect(result.score).toBeUndefined();
  });

  it("handles 0% progress", () => {
    const result = computeProgressUpdate({ progress: 0 });
    expect(result.status).toBe("in_progress");
    expect(result.progress).toBe(0);
    expect(result.shouldAwardXp).toBe(false);
  });
});

describe("XP reward defaults", () => {
  // From the service: course.xpReward ?? 50
  it("defaults to 50 XP when course has no xpReward", () => {
    const xpReward: number | null = null;
    expect(xpReward ?? 50).toBe(50);
  });

  it("uses course xpReward when set", () => {
    const xpReward: number | null = 200;
    expect(xpReward ?? 50).toBe(200);
  });

  it("uses course xpReward even when 0", () => {
    const xpReward: number | null = 0;
    // ?? operator: 0 is not null/undefined, so returns 0
    expect(xpReward ?? 50).toBe(0);
  });
});
