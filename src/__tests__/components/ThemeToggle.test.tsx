import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "@/components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Reset DOM and localStorage
    document.documentElement.classList.remove("dark");
    localStorage.clear();

    // Mock window.matchMedia (not available in jsdom)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders a button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("toggles dark class on documentElement when clicked", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    // Initially light (no saved preference, no prefers-dark)
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("saves theme preference to localStorage", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(button);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("respects saved dark theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);

    // The useEffect should have added dark class
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("respects saved light theme from localStorage", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
