import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (classname merge utility)", () => {
  it("merges simple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("handles false conditionals (filters them out)", () => {
    const result = cn("base", false && "hidden");
    expect(result).toBe("base");
  });

  it("merges tailwind conflicting classes (last wins)", () => {
    // twMerge resolves conflicts: p-4 and p-2 -> p-2
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("merges tailwind color conflicts", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles undefined and null values", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });

  it("handles empty string", () => {
    const result = cn("");
    expect(result).toBe("");
  });

  it("handles no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles arrays of classes", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("handles objects with boolean values", () => {
    const result = cn({ "text-bold": true, hidden: false });
    expect(result).toBe("text-bold");
  });
});
