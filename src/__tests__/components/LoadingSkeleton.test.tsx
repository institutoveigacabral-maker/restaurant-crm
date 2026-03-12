import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CardSkeleton, TableSkeleton, StatSkeleton } from "@/components/LoadingSkeleton";

describe("Loading Skeletons", () => {
  it("CardSkeleton renders with animate-pulse", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("TableSkeleton renders correct number of rows", () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const rows = container.querySelectorAll(".border-b");
    // header border + 3 row borders
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("TableSkeleton defaults to 5 rows", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll(".px-6");
    expect(rows).toHaveLength(5);
  });

  it("StatSkeleton renders with animate-pulse", () => {
    const { container } = render(<StatSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
