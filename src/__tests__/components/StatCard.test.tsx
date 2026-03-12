import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/StatCard";
import { Users } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Clientes" value="42" icon={Users} />);
    expect(screen.getByText("Total Clientes")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders change text when provided", () => {
    render(
      <StatCard
        title="Receita"
        value="R$ 1.000"
        icon={Users}
        change="+10% vs ontem"
        changeType="positive"
      />
    );
    expect(screen.getByText("+10% vs ontem")).toBeInTheDocument();
  });

  it("does not render change when not provided", () => {
    const { container } = render(<StatCard title="Receita" value="R$ 1.000" icon={Users} />);
    const changeElements = container.querySelectorAll(".text-green-600, .text-red-600");
    expect(changeElements).toHaveLength(0);
  });

  it("applies positive color class", () => {
    render(<StatCard title="Test" value="10" icon={Users} change="+5" changeType="positive" />);
    const change = screen.getByText("+5");
    expect(change.className).toContain("text-green-600");
  });

  it("applies negative color class", () => {
    render(<StatCard title="Test" value="10" icon={Users} change="-5" changeType="negative" />);
    const change = screen.getByText("-5");
    expect(change.className).toContain("text-red-600");
  });
});
